"use client";

import { useState, useEffect, useRef } from "react";
import "./Destaque.css";
import { useToast } from "../Toast/Toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

// SEGURANÇA (2.6): Sanitiza URL de foto para prevenir injeção de protocolo (javascript:, data:, etc.)
const sanitizarUrlFoto = (url) => {
  if (!url || typeof url !== "string") return "";
  const limpa = url.trim();
  if (limpa.startsWith("/") || limpa.startsWith("https://")) {
    return limpa;
  }
  return "";
};

const Destaque = ({ usuario, curtidas, setCurtidas, onImovelClick }) => {
  const { showToast } = useToast();
  const [imoveisDestaque, setImoveisDestaque] = useState([]);
  const [imagemAtual, setImagemAtual] = useState({});
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  /* Estado para controlar swipe de imagens dentro dos cards com animação suave */
  const [imageSwipeStates, setImageSwipeStates] = useState({});
  /* Ref para armazenar estado do gesto por imóvel, sem causar re-renders - correção swipe vs scroll */
  const gestureRefs = useRef({});
  /* Ref para anexar touchmove não-passivo no carousel interno de imagens (necessário no iOS Safari) */
  const innerCarouselRefs = useRef({});
  /* Ref para o gesto do carousel de cards (Destaque) sem re-render.
     iOS Safari e alguns Androids antigos podem aplicar swipe + scroll em gesto diagonal.
     Travamos a direcao cedo e bloqueamos o scroll quando o gesto for horizontal. */
  const destaqueCarouselGestureRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startXLocal: 0,
    scrollLeft: 0,
    directionLocked: false,
    isHorizontal: false,
  });

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* Registra touchmove com passive:false no carousel de cards (Destaque) para permitir preventDefault no iOS Safari */
  useEffect(() => {
    const el = carouselRef.current;
    if (!isMobile || !el) return;

    const handler = (e) => {
      // Se o toque veio do carousel interno (imagens), nao interferimos.
      if (e.target?.closest?.(".destaque-carousel-inner")) return;

      const gesture = destaqueCarouselGestureRef.current;
      if (!gesture.active) return;

      const touch = e.touches && e.touches[0];
      if (!touch) return;

      const diffX = touch.clientX - gesture.startX;
      const diffY = touch.clientY - gesture.startY;
      const absDiffX = Math.abs(diffX);
      const absDiffY = Math.abs(diffY);

      const LOCK_THRESHOLD = 4; // px

      if (!gesture.directionLocked) {
        if (absDiffX < LOCK_THRESHOLD && absDiffY < LOCK_THRESHOLD) return;
        gesture.directionLocked = true;
        gesture.isHorizontal = absDiffX >= absDiffY;
      }

      if (gesture.isHorizontal) e.preventDefault();
    };

    el.addEventListener("touchmove", handler, { passive: false });
    return () => el.removeEventListener("touchmove", handler);
  }, [isMobile]);

  /* Registra touchmove com passive:false nos carousels internos (imagens) para permitir preventDefault no iOS Safari */
  useEffect(() => {
    const refs = innerCarouselRefs.current;
    const handlers = {};

    Object.keys(refs).forEach((id) => {
      const el = refs[id];
      if (!el) return;
      const handler = (e) => {
        const gesture = gestureRefs.current[id];
        if (!gesture) return;

        // iOS Safari (e alguns Androids antigos): swipe diagonal pode aplicar scroll + swipe ao mesmo tempo.
        // Travamos a direção cedo e bloqueamos o scroll assim que identificamos gesto horizontal.
        const touch = e.touches && e.touches[0];
        if (!touch) return;

        const diffX = touch.clientX - gesture.startX;
        const diffY = touch.clientY - gesture.startY;
        const absDiffX = Math.abs(diffX);
        const absDiffY = Math.abs(diffY);

        const LOCK_THRESHOLD = 4; // px

        if (!gesture.directionLocked) {
          if (absDiffX < LOCK_THRESHOLD && absDiffY < LOCK_THRESHOLD) return;
          gesture.directionLocked = true;
          gesture.isHorizontal = absDiffX >= absDiffY;
        }

        if (gesture.isHorizontal) e.preventDefault();
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

  // Fetch featured properties
  useEffect(() => {
    fetch("/api/imoveis")
      .then((res) => res.json())
      .then((data) => {
        const destaques = data.filter((imovel) => imovel.destaque === true);
        setImoveisDestaque(destaques);
      })
      .catch((err) =>
        console.error("Erro ao buscar imóveis em destaque:", err),
      );
  }, []);

  // Toggle like/unlike
  const toggleCurtida = async (e, imovel) => {
    e.stopPropagation();
    const imovelId = imovel?.id ?? imovel?.imovel_id;
    if (!imovelId) {
      console.error("ID do imóvel não encontrado:", imovel);
      return;
    }

    if (!usuario || !usuario.id) {
      showToast("Você precisa fazer login para curtir os imóveis!", "warning");
      return;
    }

    // Permissão: administradores também podem curtir/descurtir imóveis.
    // A API valida (via JWT) que a curtida é feita apenas para o próprio usuário logado.

    try {
      const token = localStorage.getItem("nolare_token");
      const res = await fetch(`/api/curtidas/${usuario.id}/${imovelId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Erro ao alternar curtida");

      const likeBtn = document.querySelector(
        `[data-destaque-imovel-id="${imovelId}"]`,
      );
      if (likeBtn && !curtidas[imovelId]) {
        likeBtn.classList.add("heart-burst");
        setTimeout(() => likeBtn.classList.remove("heart-burst"), 600);
      }

      setCurtidas((prev) => ({
        ...prev,
        [imovelId]: !prev[imovelId],
      }));
    } catch (err) {
      console.error(err);
      showToast("Não foi possível curtir/descurtir o imóvel.", "error");
    }
  };

  // Image navigation
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

  // Carousel navigation
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const card = carouselRef.current.querySelector(".destaque-card");
      if (!card) return;

      // Calcula largura do card + gap
      const cardWidth = card.offsetWidth;
      const gap = 28.8; // 1.8rem em pixels (aproximadamente)
      const scrollAmount = cardWidth + gap;

      carouselRef.current.scrollBy({
        left: direction === "next" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMouseDown = (e) => {
    if (!isMobile) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isMobile) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = x - startX;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    setIsDragging(true);
    const touch = e.touches && e.touches[0];
    if (!touch || !carouselRef.current) return;

    const startXLocal = touch.pageX - carouselRef.current.offsetLeft;
    const currentScrollLeft = carouselRef.current.scrollLeft;

    setStartX(startXLocal);
    setScrollLeft(currentScrollLeft);

    // Inicializa o estado do gesto do carousel de cards.
    destaqueCarouselGestureRef.current.active = true;
    destaqueCarouselGestureRef.current.startX = touch.clientX;
    destaqueCarouselGestureRef.current.startY = touch.clientY;
    destaqueCarouselGestureRef.current.startXLocal = startXLocal;
    destaqueCarouselGestureRef.current.scrollLeft = currentScrollLeft;
    destaqueCarouselGestureRef.current.directionLocked = false;
    destaqueCarouselGestureRef.current.isHorizontal = false;
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !isMobile) return;
    const touch = e.touches && e.touches[0];
    if (!touch || !carouselRef.current) return;

    const gesture = destaqueCarouselGestureRef.current;
    if (!gesture.active) return;

    const diffX = touch.clientX - gesture.startX;
    const diffY = touch.clientY - gesture.startY;
    const absDiffX = Math.abs(diffX);
    const absDiffY = Math.abs(diffY);

    const LOCK_THRESHOLD = 4; // px

    if (!gesture.directionLocked) {
      if (absDiffX < LOCK_THRESHOLD && absDiffY < LOCK_THRESHOLD) return;
      gesture.directionLocked = true;
      gesture.isHorizontal = absDiffX >= absDiffY;

      // Se o gesto for vertical, cancela o drag do carousel e deixa o scroll da pagina agir.
      if (!gesture.isHorizontal) {
        gesture.active = false;
        setIsDragging(false);
        return;
      }
    }

    if (!gesture.isHorizontal) return;

    const xLocal = touch.pageX - carouselRef.current.offsetLeft;
    const walk = xLocal - gesture.startXLocal;
    carouselRef.current.scrollLeft = gesture.scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    destaqueCarouselGestureRef.current.active = false;
    destaqueCarouselGestureRef.current.directionLocked = false;
    destaqueCarouselGestureRef.current.isHorizontal = false;
    setIsDragging(false);
  };

  /* Retorna o translateX atual para a imagem do card - animação suave igual ao ImovelModal */
  const getImageTranslate = (id, total) => {
    const state = imageSwipeStates[id];
    if (!state) return -(imagemAtual[id] || 0) * 100;
    return state.currentTranslate;
  };

  /* Início do swipe de imagem: registra posição X e Y para diferenciar swipe de scroll */
  const handleImageTouchStart = (e, id, total) => {
    if (!isMobile) return;
    /* Impede propagação para que o carousel da seção não receba o evento */
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
        swiping: false,
      },
    }));
  };

  /* Movimento do swipe: diferencia gesto horizontal (troca de imagem) de vertical (scroll) */
  const handleImageTouchMove = (e, id, total) => {
    if (!isMobile) return;
    const state = imageSwipeStates[id];
    if (!state || !state.isDragging) return;
    /* Impede propagação para bloquear navegação do carousel da seção */
    e.stopPropagation();
    const touch = e.touches[0];
    const gesture = gestureRefs.current[id];
    if (!gesture) return;

    const diffX = touch.clientX - gesture.startX;
    const diffY = touch.clientY - gesture.startY;

    /* Se a direção ainda não foi determinada, usar threshold menor para travar cedo (evita swipe diagonal + scroll) */
    if (!gesture.directionLocked) {
      const absDiffX = Math.abs(diffX);
      const absDiffY = Math.abs(diffY);
      if (absDiffX < 4 && absDiffY < 4) return;
      if (absDiffX >= absDiffY) {
        /* Gesto predominantemente horizontal: ativar swipe de imagem */
        gesture.directionLocked = true;
        gesture.isHorizontal = true;
      } else {
        /* Gesto predominantemente vertical: liberar para scroll da página */
        gesture.directionLocked = true;
        gesture.isHorizontal = false;
        /* Cancelar o estado de dragging pois é um scroll vertical */
        setImageSwipeStates((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            isDragging: false,
            swiping: false,
          },
        }));
        return;
      }
    }

    /* Se o gesto é vertical, não processar */
    if (!gesture.isHorizontal) return;

    /* Bloquear scroll vertical enquanto o swipe horizontal estiver ativo */
    e.preventDefault();

    /* Converte pixels em porcentagem relativa à largura do container */
    const containerEl = e.currentTarget;
    const width = containerEl.offsetWidth || 1;
    const diffPercent = (diffX / width) * 100;
    /* Resistência nas bordas */
    const currentIndex = imagemAtual[id] || 0;
    let newTranslate = state.prevTranslate + diffPercent;
    if (currentIndex === 0 && diffPercent > 0) {
      newTranslate = state.prevTranslate + diffPercent * 0.3;
    } else if (currentIndex === total - 1 && diffPercent < 0) {
      newTranslate = state.prevTranslate + diffPercent * 0.3;
    }
    setImageSwipeStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        currentTranslate: newTranslate,
        swiping: Math.abs(diffX) > 4,
      },
    }));
  };

  /* Fim do swipe de imagem: decide troca de imagem ou retorno à posição atual */
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
        [id]: { ...prev[id], isDragging: false, swiping: false },
      }));
      return;
    }
    const currentIndex = imagemAtual[id] || 0;
    /* Diferença em porcentagem para decidir troca (threshold: 20%) */
    const movedBy = state.currentTranslate - state.prevTranslate;
    let novoIndex = currentIndex;
    if (movedBy < -20 && currentIndex < total - 1) {
      novoIndex = currentIndex + 1;
    } else if (movedBy > 20 && currentIndex > 0) {
      novoIndex = currentIndex - 1;
    }
    const snapTranslate = -novoIndex * 100;
    setImagemAtual((prev) => ({ ...prev, [id]: novoIndex }));
    setImageSwipeStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        currentTranslate: snapTranslate,
        prevTranslate: snapTranslate,
        isDragging: false,
        swiping: false,
      },
    }));
  };

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

  if (imoveisDestaque.length === 0) {
    return null;
  }

  return (
    <div className="destaque-section">
      <h2 className="destaque-title">Imóveis em Destaque</h2>

      <div className="destaque-carousel-wrapper">
        <div
          className="destaque-carousel"
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          /* Bloqueio do carousel quando um swipe de imagem estiver ativo - tarefa 1 */
          onTouchStart={(e) => {
            /* Só inicia drag do carousel se não vier de dentro de um image-swipe - tarefa 1 */
            if (e.target.closest(".destaque-carousel-inner")) return;
            handleTouchStart(e);
          }}
          onTouchMove={(e) => {
            if (e.target.closest(".destaque-carousel-inner")) return;
            handleTouchMove(e);
          }}
          onTouchEnd={(e) => {
            if (e.target.closest(".destaque-carousel-inner")) return;
            handleTouchEnd(e);
          }}
        >
          {imoveisDestaque.map((imovel) => (
            <div
              className="destaque-card"
              key={imovel.id ?? imovel.imovel_id}
              onClick={() => onImovelClick(imovel)}
            >
              <div className="destaque-image-container">
                {/* Carousel de imagens com animação suave igual ao ImovelModal - tarefa 1 */}
                {imovel.fotos?.length > 0 ? (
                  <div
                    className="destaque-carousel-inner"
                    ref={(el) => {
                      const key = imovel.id ?? imovel.imovel_id;
                      if (el) innerCarouselRefs.current[key] = el;
                    }}
                    /* Handlers de swipe que bloqueiam propagação para o carousel da seção - tarefa 1 */
                    onTouchStart={(e) =>
                      handleImageTouchStart(
                        e,
                        imovel.id ?? imovel.imovel_id,
                        imovel.fotos.length,
                      )
                    }
                    onTouchMove={(e) =>
                      handleImageTouchMove(
                        e,
                        imovel.id ?? imovel.imovel_id,
                        imovel.fotos.length,
                      )
                    }
                    onTouchEnd={(e) =>
                      handleImageTouchEnd(
                        e,
                        imovel.id ?? imovel.imovel_id,
                        imovel.fotos.length,
                      )
                    }
                  >
                    {/* Track com translateX e transição suave - tarefa 1 */}
                    <div
                      className="destaque-image-track"
                      style={{
                        transform: `translateX(${getImageTranslate(imovel.id ?? imovel.imovel_id, imovel.fotos.length)}%)`,
                        transition: imageSwipeStates[
                          imovel.id ?? imovel.imovel_id
                        ]?.isDragging
                          ? "none"
                          : "transform 0.32s cubic-bezier(0.22, 0.9, 0.2, 1)",
                      }}
                    >
                      {imovel.fotos.map((foto, idx) => (
                        <img
                          key={idx}
                          src={sanitizarUrlFoto(foto.caminho_foto)}
                          alt={`${imovel.titulo} - foto ${idx + 1}`}
                          className="destaque-image"
                          loading="lazy"
                          decoding="async"
                        />
                      ))}
                    </div>
                    {/* Setas de navegação - apenas desktop - tarefa 1 */}
                    <button
                      className="destaque-carousel-btn prev"
                      onClick={(e) =>
                        imagemAnterior(
                          e,
                          imovel.id ?? imovel.imovel_id,
                          imovel.fotos.length,
                        )
                      }
                    >
                      🡰
                    </button>
                    <button
                      className="destaque-carousel-btn next"
                      onClick={(e) =>
                        proximaImagem(
                          e,
                          imovel.id ?? imovel.imovel_id,
                          imovel.fotos.length,
                        )
                      }
                    >
                      🡲
                    </button>
                  </div>
                ) : (
                  <div className="destaque-no-image">Sem imagem</div>
                )}
              </div>

              <div className="destaque-content">
                <div className="destaque-header">
                  <h3 className="destaque-title-card">{imovel.titulo}</h3>
                  <div className="destaque-price-container">
                    {imovel.preco_destaque && imovel.preco_destaque > 0 ? (
                      <>
                        <div className="destaque-price-original">
                          R$ {formatPrice(imovel.preco)}
                        </div>
                        <div className="destaque-price-discount">
                          R$ {formatPrice(imovel.preco_destaque)}
                        </div>
                      </>
                    ) : (
                      <div className="destaque-price">
                        R$ {formatPrice(imovel.preco)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="destaque-details">
                  <div>
                    📍 {imovel.cidade || "Cidade não informada"} -{" "}
                    {imovel.bairro || "Bairro não informada"}
                  </div>
                  {imovel.caracteristicas?.lancamento && (
                    <div className="destaque-lancamento">🚀 Lançamento</div>
                  )}
                  {imovel.caracteristicas?.data_entrega && (
                    <div className="destaque-entrega">
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

                <div className="destaque-features">
                  {imovel.caracteristicas?.quarto && (
                    <div className="destaque-feature">
                      🛏 {imovel.caracteristicas.quarto} quartos
                    </div>
                  )}
                  {imovel.caracteristicas?.banheiro && (
                    <div className="destaque-feature">
                      🛁 {imovel.caracteristicas.banheiro} banheiros
                    </div>
                  )}
                  {imovel.caracteristicas?.vaga && (
                    <div className="destaque-feature">
                      🚗 {imovel.caracteristicas.vaga} vagas
                    </div>
                  )}
                </div>

                <div className="destaque-actions">
                  <button
                    className="destaque-contact-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open("https://www.youtube.com", "_blank");
                    }}
                  >
                    Entrar em Contato
                  </button>

                  <button
                    className="destaque-like-btn"
                    data-destaque-imovel-id={imovel.id ?? imovel.imovel_id}
                    onClick={(e) => toggleCurtida(e, imovel)}
                  >
                    {curtidas[imovel.id ?? imovel.imovel_id] ? (
                      <AiFillHeart size={26} color="#191970" />
                    ) : (
                      <AiOutlineHeart size={26} color="#191970" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="destaque-nav-buttons">
          <button
            className="destaque-nav-btn"
            onClick={() => scrollCarousel("prev")}
          >
            🡰
          </button>
          <button
            className="destaque-nav-btn"
            onClick={() => scrollCarousel("next")}
          >
            🡲
          </button>
        </div>
      </div>
    </div>
  );
};

export default Destaque;
