"use client";

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Curtidas.css";
import ImovelModal from "../../ImovelModal/ImovelModal";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const Curtidas = ({ usuario }) => {
  const [imoveis, setImoveis] = useState([]);
  const [imovelSelecionado, setImovelSelecionado] = useState(null);
  const [imagemAtual, setImagemAtual] = useState({});
  const [curtidas, setCurtidas] = useState({});
  /* Estado para detectar dispositivo mobile */
  const [isMobile, setIsMobile] = useState(false);
  /* Estado de swipe de imagem por imóvel com animação suave */
  const [imageSwipeStates, setImageSwipeStates] = useState({});
  /* Ref para armazenar estado do gesto por imóvel, sem causar re-renders - correção swipe vs scroll */
  const gestureRefs = useRef({});
  /* Refs para os containers de carousel de cada card - correção swipe iOS Safari */
  const carouselRefs = useRef({});

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

  /* Registra touchmove com passive:false nos carousels para permitir preventDefault no iOS Safari */
  useEffect(() => {
    const refs = carouselRefs.current;
    const handlers = {};

    Object.keys(refs).forEach((id) => {
      const el = refs[id];
      if (!el) return;
      const handler = (e) => {
        const gesture = gestureRefs.current[id];
        if (gesture && gesture.directionLocked && gesture.isHorizontal) {
          e.preventDefault();
        }
      };
      handlers[id] = handler;
      el.addEventListener("touchmove", handler, { passive: false });
    });

    return () => {
      Object.keys(handlers).forEach((id) => {
        const el = refs[id];
        if (el && handlers[id]) {
          el.removeEventListener("touchmove", handlers[id]);
        }
      });
    };
  });

  /* Retorna translateX em % para o track de imagens do card */
  const getImageTranslate = (id) => {
    const state = imageSwipeStates[id];
    if (!state) return -(imagemAtual[id] || 0) * 100;
    return state.currentTranslate;
  };

  /* Início do swipe de imagem: registra posição X e Y para diferenciar swipe de scroll */
  const handleImageTouchStart = (e, id, total) => {
    if (!isMobile) return;
    e.stopPropagation();
    const touch = e.touches[0];
    const currentIndex = imagemAtual[id] || 0;
    const prevTranslate = -currentIndex * 100;
    /* Inicializa o estado do gesto para este card */
    gestureRefs.current[id] = {
      startX: touch.clientX,
      startY: touch.clientY,
      directionLocked: false,
      isHorizontal: false,
    };
    setImageSwipeStates((prev) => ({
      ...prev,
      [id]: {
        startX: touch.clientX,
        currentTranslate: prevTranslate,
        prevTranslate,
        isDragging: true,
      },
    }));
  };

  /* Movimento do swipe: diferencia gesto horizontal (troca de imagem) de vertical (scroll) */
  const handleImageTouchMove = (e, id, total) => {
    if (!isMobile) return;
    const state = imageSwipeStates[id];
    if (!state || !state.isDragging) return;
    e.stopPropagation();
    const touch = e.touches[0];
    const gesture = gestureRefs.current[id];
    if (!gesture) return;

    const diffX = touch.clientX - gesture.startX;
    const diffY = touch.clientY - gesture.startY;

    /* Se a direção ainda não foi determinada, usar threshold de 8px */
    if (!gesture.directionLocked) {
      const absDiffX = Math.abs(diffX);
      const absDiffY = Math.abs(diffY);
      if (absDiffX < 8 && absDiffY < 8) return;
      if (absDiffX >= absDiffY) {
        /* Gesto predominantemente horizontal: ativar swipe de imagem */
        gesture.directionLocked = true;
        gesture.isHorizontal = true;
      } else {
        /* Gesto predominantemente vertical: liberar para scroll da página */
        gesture.directionLocked = true;
        gesture.isHorizontal = false;
        setImageSwipeStates((prev) => ({
          ...prev,
          [id]: { ...prev[id], isDragging: false },
        }));
        return;
      }
    }

    /* Se o gesto é vertical, não processar */
    if (!gesture.isHorizontal) return;

    /* Bloquear scroll vertical enquanto o swipe horizontal estiver ativo */
    e.preventDefault();

    const width = e.currentTarget.offsetWidth || 1;
    const diffPercent = (diffX / width) * 100;
    const currentIndex = imagemAtual[id] || 0;
    let newTranslate = state.prevTranslate + diffPercent;
    /* Resistência nas bordas */
    if (currentIndex === 0 && diffPercent > 0) {
      newTranslate = state.prevTranslate + diffPercent * 0.3;
    } else if (currentIndex === total - 1 && diffPercent < 0) {
      newTranslate = state.prevTranslate + diffPercent * 0.3;
    }
    setImageSwipeStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], currentTranslate: newTranslate },
    }));
  };

  /* Fim do swipe: decide troca de imagem ou retorno com animação suave */
  const handleImageTouchEnd = (e, id, total) => {
    if (!isMobile) return;
    const state = imageSwipeStates[id];
    if (!state || !state.isDragging) return;
    e.stopPropagation();
    const gesture = gestureRefs.current[id];
    /* Se o gesto não foi horizontal, apenas limpar o estado */
    if (!gesture || !gesture.isHorizontal) {
      setImageSwipeStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], isDragging: false },
      }));
      return;
    }
    const currentIndex = imagemAtual[id] || 0;
    const movedBy = state.currentTranslate - state.prevTranslate;
    let novoIndex = currentIndex;
    if (movedBy < -20 && currentIndex < total - 1) novoIndex = currentIndex + 1;
    else if (movedBy > 20 && currentIndex > 0) novoIndex = currentIndex - 1;
    const snapTranslate = -novoIndex * 100;
    setImagemAtual((prev) => ({ ...prev, [id]: novoIndex }));
    setImageSwipeStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        currentTranslate: snapTranslate,
        prevTranslate: snapTranslate,
        isDragging: false,
      },
    }));
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

    /* Restaura a URL original sem navegar.
       O history.back() já foi acionado pelo ImovelModal, então só
       precisamos garantir que a URL reflita a página atual. */
    const currentPath = window.location.pathname;
    if (currentPath.startsWith("/imovel/")) {
      window.history.replaceState(null, "", "/curtidas");
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
                {/* Carousel com animação suave e bloqueio de swipe conflitante - tarefa 1 */}
                {imovel.fotos && imovel.fotos.length > 0 ? (
                  <div
                    className="carousel"
                    ref={(el) => {
                      carouselRefs.current[imovel.imovel_id] = el;
                    }}
                    onTouchStart={(e) =>
                      handleImageTouchStart(
                        e,
                        imovel.imovel_id,
                        imovel.fotos.length,
                      )
                    }
                    onTouchMove={(e) =>
                      handleImageTouchMove(
                        e,
                        imovel.imovel_id,
                        imovel.fotos.length,
                      )
                    }
                    onTouchEnd={(e) =>
                      handleImageTouchEnd(
                        e,
                        imovel.imovel_id,
                        imovel.fotos.length,
                      )
                    }
                  >
                    {/* Track com translateX e transição suave - tarefa 1 */}
                    <div
                      className="property-image-track"
                      style={{
                        transform: `translateX(${getImageTranslate(imovel.imovel_id)}%)`,
                        transition: imageSwipeStates[imovel.imovel_id]
                          ?.isDragging
                          ? "none"
                          : "transform 0.32s cubic-bezier(0.22, 0.9, 0.2, 1)",
                      }}
                    >
                      {imovel.fotos.map((foto, idx) => (
                        <img
                          key={idx}
                          src={foto.caminho_foto}
                          alt={`${imovel.titulo} - foto ${idx + 1}`}
                          className="property-image"
                          loading="lazy"
                          decoding="async"
                        />
                      ))}
                    </div>
                    <button
                      className="carousel-btn prev"
                      onClick={(e) =>
                        imagemAnterior(e, imovel.imovel_id, imovel.fotos.length)
                      }
                    >
                      🡰
                    </button>
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
          parentPushedHistory={true}
        />
      )}
    </div>
  );
};

export default Curtidas;
