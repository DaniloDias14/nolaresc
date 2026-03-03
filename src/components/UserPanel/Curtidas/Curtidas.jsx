"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Curtidas.css";
import ImovelModal from "../../ImovelModal/ImovelModal";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const Curtidas = ({ usuario }) => {
  const [imoveis, setImoveis] = useState([]);
  const [imovelSelecionado, setImovelSelecionado] = useState(null);
  const [imagemAtual, setImagemAtual] = useState({});
  const [curtidas, setCurtidas] = useState({});
  /* Estado para detectar dispositivo mobile - correção solicitada */
  const [isMobile, setIsMobile] = useState(false);
  /* Estado para controlar swipe de imagens dentro dos cards no mobile - correção solicitada */
  const [imageSwipeStart, setImageSwipeStart] = useState(null);

  const navigate = useNavigate();

  const formatPrice = (value) => {
    if (!value || value === 0) return "0,00";

    const numValue =
      typeof value === "string" ? Number.parseFloat(value) : value;
    const cents = Math.round(numValue * 100);
    const intPart = Math.floor(cents / 100);
    const decPart = (cents % 100).toString().padStart(2, "0");
    const formattedInt = intPart
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${formattedInt},${decPart}`;
  };

  /* Detectar dispositivo mobile - correção solicitada */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!usuario || usuario.tipo_usuario === "adm") return;

    fetch(`/api/curtidas/${usuario.id}`)
      .then((res) => res.json())
      .then(async (data) => {
        const sortedData = data.sort(
          (a, b) => new Date(b.data_curtida) - new Date(a.data_curtida),
        );

        const curtidasMap = {};
        const imoveisCompletos = [];

        for (const c of sortedData) {
          curtidasMap[c.imovel_id] = true;

          const imovel = await fetch(`/api/imoveis/${c.imovel_id}`).then(
            (res) => res.json(),
          );
          imoveisCompletos.push({ ...imovel, fotos: imovel.fotos || [] });
        }

        setCurtidas(curtidasMap);
        setImoveis(imoveisCompletos);
      })
      .catch((err) => console.error("Erro ao buscar curtidas:", err));
  }, [usuario]);

  const removerImovel = (imovelId) => {
    setImoveis((prev) => prev.filter((i) => i.imovel_id !== imovelId));
  };

  const adicionarImovel = async (imovelId) => {
    setImoveis((prev) => {
      if (prev.some((i) => i.imovel_id === imovelId)) return prev;
      return [...prev, { imovel_id: imovelId, carregando: true }];
    });

    try {
      const novoImovel = await fetch(`/api/imoveis/${imovelId}`).then((res) =>
        res.json(),
      );

      setImoveis((prev) =>
        prev.map((i) =>
          i.imovel_id === imovelId && i.carregando
            ? { ...novoImovel, fotos: novoImovel.fotos || [] }
            : i,
        ),
      );
    } catch (err) {
      console.error("Erro ao adicionar imóvel curtido:", err);
      setImoveis((prev) =>
        prev.filter((i) => i.imovel_id !== imovelId || !i.carregando),
      );
    }
  };

  const toggleCurtida = async (imovelId) => {
    if (!usuario) return;

    try {
      const res = await fetch(`/api/curtidas/${usuario.id}/${imovelId}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Erro ao alternar curtida");

      const likeBtn = document.querySelector(`[data-imovel-id="${imovelId}"]`);
      if (likeBtn && curtidas[imovelId]) {
        likeBtn.classList.add("heart-burst");
        setTimeout(() => likeBtn.classList.remove("heart-burst"), 600);
      }

      setCurtidas((prev) => {
        const atualizado = { ...prev, [imovelId]: !prev[imovelId] };

        if (prev[imovelId] && !atualizado[imovelId]) {
          removerImovel(imovelId);
        }

        if (!prev[imovelId] && atualizado[imovelId]) {
          adicionarImovel(imovelId);
        }

        return atualizado;
      });
    } catch (err) {
      console.error(err);
    }
  };

  /* Swipe de imagens dentro dos cards no mobile - correção solicitada */
  const handleImageTouchStart = (e) => {
    if (!isMobile) return;
    setImageSwipeStart(e.touches[0].clientX);
  };

  const handleImageTouchEnd = (e, id, total) => {
    if (!isMobile || imageSwipeStart === null) return;
    const diff = imageSwipeStart - e.changedTouches[0].clientX;
    /* Swipe mínimo de 50px para trocar imagem */
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        /* Swipe para esquerda - próxima imagem */
        setImagemAtual((prev) => ({
          ...prev,
          [id]: ((prev[id] || 0) + 1) % total,
        }));
      } else {
        /* Swipe para direita - imagem anterior */
        setImagemAtual((prev) => ({
          ...prev,
          [id]: (prev[id] || 0) === 0 ? total - 1 : (prev[id] || 0) - 1,
        }));
      }
    }
    setImageSwipeStart(null);
  };

  const proximaImagem = (e, id, total) => {
    e.stopPropagation();
    setImagemAtual((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % total,
    }));
  };

  const imagemAnterior = (e, id, total) => {
    e.stopPropagation();
    setImagemAtual((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) === 0 ? total - 1 : (prev[id] || 0) - 1,
    }));
  };

  const handleOpenModal = (imovel) => {
    const imovelId = imovel.imovel_id;
    setImovelSelecionado(imovel);

    // Update URL without navigation to preserve scroll position
    window.history.pushState(null, "", `/imovel/${imovelId}`);
  };

  const handleCloseModal = () => {
    setImovelSelecionado(null);

    // Go back in history to restore original URL
    if (window.location.pathname.startsWith("/imovel/")) {
      window.history.back();
    }
  };

  if (!usuario) return <p>Faça login para ver seus imóveis curtidos.</p>;

  return (
    <div className="curtidas-page">
      <h2>Imóveis Curtidos</h2>

      {imoveis.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">
            <AiOutlineHeart size={120} color="var(--primary-blue)" />
          </div>
          <h3>Nenhum imóvel curtido ainda</h3>
          <p>Explore nossos imóveis e favorite os que mais gostar!</p>
        </div>
      ) : (
        <div className="curtidas-grid">
          {imoveis.map((imovel) => (
            <div
              className="property-card"
              key={imovel.imovel_id}
              onClick={() => handleOpenModal(imovel)}
            >
              <div className="image-container">
                {/* Adicionado swipe de imagens no mobile - correção solicitada */}
                {imovel.fotos && imovel.fotos.length > 0 ? (
                  <div
                    className="carousel"
                    onTouchStart={handleImageTouchStart}
                    onTouchEnd={(e) =>
                      handleImageTouchEnd(
                        e,
                        imovel.imovel_id,
                        imovel.fotos.length,
                      )
                    }
                  >
                    <button
                      className="carousel-btn prev"
                      onClick={(e) =>
                        imagemAnterior(e, imovel.imovel_id, imovel.fotos.length)
                      }
                    >
                      🡰
                    </button>
                    <img
                      src={`${
                        imovel.fotos[imagemAtual[imovel.imovel_id] || 0]
                          ?.caminho_foto
                      }`}
                      alt={imovel.titulo}
                      className="property-image"
                    />
                    <button
                      className="carousel-btn next"
                      onClick={(e) =>
                        proximaImagem(e, imovel.imovel_id, imovel.fotos.length)
                      }
                    >
                      🡲
                    </button>
                  </div>
                ) : (
                  <div className="no-image">Sem imagem</div>
                )}
              </div>

              <div className="property-content">
                <div className="property-header">
                  <h3 className="property-title">{imovel.titulo}</h3>
                  <div className="property-price-container">
                    {imovel.preco_destaque && imovel.preco_destaque > 0 ? (
                      <>
                        <div className="property-price-original">
                          R$ {formatPrice(imovel.preco)}
                        </div>
                        <div className="property-price-discount">
                          R$ {formatPrice(imovel.preco_destaque)}
                        </div>
                      </>
                    ) : (
                      <div className="property-price">
                        R$ {formatPrice(imovel.preco)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="property-details">
                  {imovel.caracteristicas?.lancamento && (
                    <div className="property-lancamento">🚀 Lançamento</div>
                  )}
                  <div>
                    📍 {imovel.cidade || "Cidade não informada"} -{" "}
                    {imovel.bairro || "Bairro não informado"}
                  </div>
                  {imovel.caracteristicas?.data_entrega && (
                    <div className="property-entrega">
                      📅 Entrega:{" "}
                      {new Date(
                        imovel.caracteristicas.data_entrega,
                      ).toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>

                <div className="property-features">
                  {imovel.caracteristicas?.quarto && (
                    <div className="feature">
                      🛏 {imovel.caracteristicas.quarto} quartos
                    </div>
                  )}
                  {imovel.caracteristicas?.banheiro && (
                    <div className="feature">
                      🛁 {imovel.caracteristicas.banheiro} banheiros
                    </div>
                  )}
                  {imovel.caracteristicas?.vaga && (
                    <div className="feature">
                      🚗 {imovel.caracteristicas.vaga} vagas
                    </div>
                  )}
                </div>

                <div className="action-buttons">
                  <button
                    className="contact-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open("https://www.youtube.com", "_blank");
                    }}
                  >
                    Entrar em Contato
                  </button>

                  <button
                    className="like-btn"
                    data-imovel-id={imovel.imovel_id}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCurtida(imovel.imovel_id);
                    }}
                  >
                    {curtidas[imovel.imovel_id] ? (
                      <AiFillHeart size={28} color="#191970" />
                    ) : (
                      <AiOutlineHeart size={28} color="#191970" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {imovelSelecionado && (
        <ImovelModal
          imovel={imovelSelecionado}
          onClose={handleCloseModal}
          usuario={usuario}
          curtidas={curtidas}
          setCurtidas={setCurtidas}
          onDescurtir={removerImovel}
          onCurtir={adicionarImovel}
        />
      )}
    </div>
  );
};

export default Curtidas;
