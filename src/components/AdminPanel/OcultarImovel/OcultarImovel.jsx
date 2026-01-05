"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OcultarImovel.css";
import ImovelModal from "../../ImovelModal/ImovelModal";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const OcultarImovel = ({ usuario }) => {
  const [imoveis, setImoveis] = useState([]);
  const [imovelSelecionado, setImovelSelecionado] = useState(null);
  const [imagemAtual, setImagemAtual] = useState({});
  const [curtidas, setCurtidas] = useState({});

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

  // Busca imóveis ocultos
  useEffect(() => {
    if (!usuario || usuario.tipo_usuario !== "adm") return;

    fetch("http://localhost:5000/api/imoveis/ocultos")
      .then((res) => res.json())
      .then((data) => {
        const imoveisCompletos = data.map((imovel) => ({
          ...imovel,
          fotos: imovel.fotos || [],
        }));
        setImoveis(imoveisCompletos);
      })
      .catch((err) => console.error("Erro ao buscar imóveis ocultos:", err));
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
      const novoImovel = await fetch(
        `http://localhost:5000/api/imoveis/${imovelId}`
      ).then((res) => res.json());

      setImoveis((prev) =>
        prev.map((i) =>
          i.imovel_id === imovelId && i.carregando
            ? { ...novoImovel, fotos: novoImovel.fotos || [] }
            : i
        )
      );
    } catch (err) {
      console.error("Erro ao adicionar imóvel:", err);
      setImoveis((prev) =>
        prev.filter((i) => i.imovel_id !== imovelId || !i.carregando)
      );
    }
  };

  const toggleVisibilidade = async (imovelId) => {
    if (!usuario) return;

    try {
      // Busca o imóvel atual
      const imovelRes = await fetch(
        `http://localhost:5000/api/imoveis/${imovelId}`
      );
      const imovel = await imovelRes.json();

      // Atualiza visibilidade
      const res = await fetch(`http://localhost:5000/api/imoveis/${imovelId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...imovel,
          visivel: !imovel.visivel,
          atualizado_por: usuario.id,
        }),
      });

      if (!res.ok) throw new Error("Erro ao alterar visibilidade");

      // Remove da lista se tornou visível
      if (!imovel.visivel) {
        removerImovel(imovelId);
      }
    } catch (err) {
      console.error(err);
      alert("Não foi possível alterar a visibilidade do imóvel.");
    }
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

    // Atualiza URL sem navegação para preservar posição do scroll
    window.history.pushState(null, "", `/imovel/${imovelId}`);
  };

  const handleCloseModal = () => {
    setImovelSelecionado(null);

    // Volta no histórico para restaurar URL original
    if (window.location.pathname.startsWith("/imovel/")) {
      window.history.back();
    }
  };

  if (!usuario || usuario.tipo_usuario !== "adm")
    return <p>Acesso restrito a administradores.</p>;

  return (
    <div className="ocultar-imovel-page">
      <h2>Imóveis Ocultos</h2>

      {imoveis.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">
            <AiFillHeart size={120} color="var(--primary-blue)" />
          </div>
          <h3>Nenhum imóvel oculto</h3>
          <p>Todos os imóveis estão visíveis para os usuários.</p>
        </div>
      ) : (
        <div className="ocultar-imovel-grid">
          {imoveis.map((imovel) => (
            <div
              className="property-card"
              key={imovel.imovel_id}
              onClick={() => handleOpenModal(imovel)}
            >
              <div className="image-container">
                {imovel.fotos && imovel.fotos.length > 0 ? (
                  <div className="carousel">
                    <button
                      className="carousel-btn prev"
                      onClick={(e) =>
                        imagemAnterior(e, imovel.imovel_id, imovel.fotos.length)
                      }
                    >
                      🡰
                    </button>
                    <img
                      src={`http://localhost:5000${
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
                        imovel.caracteristicas.data_entrega
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
                      // Não faz nada, apenas visual para consistência
                    }}
                  >
                    <AiOutlineHeart size={26} color="#191970" />
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

export default OcultarImovel;
