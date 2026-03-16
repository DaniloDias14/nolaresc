"use client";

import { useState, useEffect, useRef } from "react";
import "./ImovelModal.css";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import {
  IoClose,
  IoShareSocialOutline,
  IoLocationOutline,
  IoHomeOutline,
  IoPencil,
} from "react-icons/io5";
import { useToast } from "../Toast/Toast";
import EditarImovel from "../AdminPanel/EditarImovel/EditarImovel";

// SEGURANÇA (2.6): Sanitiza URL de foto para prevenir injeção de protocolo (javascript:, data:, etc.)
// React já escapa strings em JSX, mas validamos o protocolo da URL de imagens explicitamente
const sanitizarUrlFoto = (url) => {
  if (!url || typeof url !== "string") return "";
  const limpa = url.trim();
  // Permite apenas URLs relativas (começando com /) ou https://
  if (limpa.startsWith("/") || limpa.startsWith("https://")) {
    return limpa;
  }
  return "";
};

const ImovelModal = ({
  imovel,
  onClose,
  usuario,
  curtidas,
  setCurtidas,
  onDescurtir,
  onCurtir,
  parentPushedHistory = false,
}) => {
  const { showToast } = useToast();
  const [fotoIndex, setFotoIndex] = useState(0);
  const [caracteristicas, setCaracteristicas] = useState(null);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const galleryRef = useRef(null);
  const thumbnailsRef = useRef(null);
  /* Flag para garantir que onClose seja chamado no máximo uma vez,
     evitando duplo clique / piscar causado por race condition entre
     history.back() e o listener popstate */
  const closedRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 968);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  /* Botão físico de voltar / seta de voltar do navegador fecha o modal.
     Se o componente pai (Comprar/Curtidas) já empurrou uma entrada no
     histórico (parentPushedHistory=true), não fazemos pushState próprio.
     Se é acesso direto (ImovelPage), fazemos pushState para que o botão
     voltar tenha algo para consumir. */
  useEffect(() => {
    closedRef.current = false;

    if (!parentPushedHistory) {
      window.history.pushState({ imovelModalOpen: true }, "");
    }

    const handlePopState = () => {
      if (closedRef.current) return;
      closedRef.current = true;
      onClose();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!imovel) return;

    const imovelId = imovel.id ?? imovel.imovel_id;

    // UX: usa o que já veio no objeto do imóvel e tenta sincronizar com a API em seguida.
    setCaracteristicas(imovel.caracteristicas || {});

    // Admin: imóveis ocultos exigem JWT nessa rota; então enviamos token quando existir.
    const token = localStorage.getItem("nolare_token");
    const fetchOptions = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    fetch(`/api/imoveis/${imovelId}`, fetchOptions)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCaracteristicas(data.caracteristicas || {});
      })
      .catch((err) => console.error("Erro ao buscar características:", err));
  }, [imovel]);

  useEffect(() => {
    setImageError(false);
  }, [fotoIndex]);

  useEffect(() => {
    if (!imovel || !imovel.fotos || imovel.fotos.length === 0) return;

    const fotos = imovel.fotos;

    // Pré-carregar todas as imagens
    fotos.forEach((foto) => {
      const img = new Image();
      img.src = `${foto.caminho_foto}`;
    });
  }, [imovel]);

  useEffect(() => {
    if (!imovel || !imovel.fotos || imovel.fotos.length === 0) return;

    const fotos = imovel.fotos;

    // Pré-carregar imagem atual
    const currentImg = new Image();
    currentImg.src = `${fotos[fotoIndex]?.caminho_foto}`;

    // Pré-carregar imagem anterior
    const prevIndex = fotoIndex - 1 >= 0 ? fotoIndex - 1 : fotos.length - 1;
    const prevImg = new Image();
    prevImg.src = `${fotos[prevIndex]?.caminho_foto}`;

    // Pré-carregar próxima imagem
    const nextIndex = fotoIndex + 1 < fotos.length ? fotoIndex + 1 : 0;
    const nextImg = new Image();
    nextImg.src = `${fotos[nextIndex]?.caminho_foto}`;

    // Pré-carregar também a segunda próxima imagem para scroll mais rápido
    const nextNextIndex =
      fotoIndex + 2 < fotos.length
        ? fotoIndex + 2
        : (fotoIndex + 2) % fotos.length;
    const nextNextImg = new Image();
    nextNextImg.src = `${fotos[nextNextIndex]?.caminho_foto}`;
  }, [fotoIndex, imovel]);

  useEffect(() => {
    if (!galleryRef.current) return;
    const width = galleryRef.current.clientWidth;
    setCurrentTranslate(-fotoIndex * width);
    setPrevTranslate(-fotoIndex * width);
  }, [fotoIndex]);

  useEffect(() => {
    if (!thumbnailsRef.current || isMobile) return;

    const thumbnailElements =
      thumbnailsRef.current.querySelectorAll(".imovel-thumbnail");
    if (thumbnailElements[fotoIndex]) {
      const thumbnail = thumbnailElements[fotoIndex];
      const container = thumbnailsRef.current;

      // Calcula a posição para centralizar a miniatura
      const thumbnailLeft = thumbnail.offsetLeft;
      const thumbnailWidth = thumbnail.offsetWidth;
      const containerWidth = container.offsetWidth;

      const scrollPosition =
        thumbnailLeft - containerWidth / 2 + thumbnailWidth / 2;

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [fotoIndex, isMobile]);

  if (!imovel) return null;

  const fotos = imovel.fotos || [];
  const curtido = !!curtidas[imovel.id ?? imovel.imovel_id];

  const formatPrice = (value) => {
    if (!value || value === 0) return "0,00";

    const numValue =
      typeof value === "string" ? Number.parseFloat(value) : value;

    // Convert to cents
    const cents = Math.round(numValue * 100);

    // Separate integer and decimal parts
    const intPart = Math.floor(cents / 100);
    const decPart = (cents % 100).toString().padStart(2, "0");

    // Format integer part with dots
    const formattedInt = intPart
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${formattedInt},${decPart}`;
  };

  const extractCoordinates = (input) => {
    if (!input) return null;
    const cleaned = input.trim();
    const pattern = /(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/;
    const match = cleaned.match(pattern);

    if (match) {
      return {
        lat: Number.parseFloat(match[1]),
        lng: Number.parseFloat(match[2]),
      };
    }

    return null;
  };

  const getMapEmbedUrl = () => {
    if (!imovel.coordenadas) return null;

    const coords = extractCoordinates(imovel.coordenadas);
    if (!coords) return null;

    if (coords.lat < -90 || coords.lat > 90) return null;
    if (coords.lng < -180 || coords.lng > 180) return null;

    return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`;
  };

  const handlePrev = () => {
    if (fotoIndex === 0) return;
    setFotoIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (fotoIndex === fotos.length - 1) return;
    setFotoIndex((prev) => prev + 1);
  };

  /* Ref para armazenar o estado do gesto sem causar re-renders - correção swipe vs scroll */
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    directionLocked: false /* true quando a direção do gesto já foi determinada */,
    isHorizontal: false /* true se o gesto foi identificado como swipe horizontal */,
  });

  /* Registra touchmove com passive:false na galeria para permitir preventDefault no iOS Safari */
  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    const handler = (e) => {
      if (
        gestureRef.current.directionLocked &&
        gestureRef.current.isHorizontal
      ) {
        e.preventDefault();
      }
    };
    el.addEventListener("touchmove", handler, { passive: false });
    return () => {
      el.removeEventListener("touchmove", handler);
    };
  }, []);

  /* Início do toque: registra posição inicial X e Y para distinguir swipe de scroll */
  const handleStart = (e) => {
    if (!isMobile || !galleryRef.current) return;
    const touch = e.touches[0];
    gestureRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      directionLocked: false,
      isHorizontal: false,
    };
    /* Marca como arrastando para preparar o acompanhamento do gesto */
    setIsDragging(true);
    setStartX(touch.clientX);
    setPrevTranslate(currentTranslate);
  };

  /* Movimento do toque: diferencia swipe horizontal (troca de imagem) de scroll vertical */
  const handleMove = (e) => {
    if (!isMobile || !isDragging || !galleryRef.current) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - gestureRef.current.startX;
    const diffY = touch.clientY - gestureRef.current.startY;

    /* Se a direção ainda não foi determinada, usar threshold de 8px para decidir */
    if (!gestureRef.current.directionLocked) {
      const absDiffX = Math.abs(diffX);
      const absDiffY = Math.abs(diffY);
      /* Aguarda até que o gesto tenha movido pelo menos 8px para determinar a direção */
      if (absDiffX < 8 && absDiffY < 8) return;
      if (absDiffX >= absDiffY) {
        /* Gesto predominantemente horizontal: ativar swipe de imagem */
        gestureRef.current.directionLocked = true;
        gestureRef.current.isHorizontal = true;
      } else {
        /* Gesto predominantemente vertical: liberar para scroll da página */
        gestureRef.current.directionLocked = true;
        gestureRef.current.isHorizontal = false;
        setIsDragging(false);
        return;
      }
    }

    /* Se o gesto é vertical, não processar (scroll da página já está liberado) */
    if (!gestureRef.current.isHorizontal) return;

    /* Bloquear scroll vertical enquanto o swipe horizontal estiver ativo */
    e.preventDefault();

    const x = touch.clientX;
    const diff = x - startX;
    const width = galleryRef.current.clientWidth;

    /* Calcular a nova posição com translate */
    let newTranslate = prevTranslate + diff;

    /* Aplicar resistência nas bordas: primeira imagem (direita) */
    if (fotoIndex === 0 && diff > 0) {
      newTranslate = prevTranslate + diff * 0.3;
    } else if (fotoIndex === fotos.length - 1 && diff < 0) {
      /* Aplicar resistência nas bordas: última imagem (esquerda) */
      newTranslate = prevTranslate + diff * 0.3;
    }

    setCurrentTranslate(newTranslate);
  };

  /* Fim do toque: decide se troca de imagem ou retorna à posição atual */
  const handleEnd = () => {
    if (!isMobile || !isDragging || !galleryRef.current) return;
    setIsDragging(false);

    /* Se o gesto não foi identificado como horizontal, não processar troca de imagem */
    if (!gestureRef.current.isHorizontal) return;

    const width = galleryRef.current.clientWidth;
    const movedBy = currentTranslate - -fotoIndex * width;

    /* Threshold de 50px para acionar a troca de imagem */
    if (movedBy < -50 && fotoIndex < fotos.length - 1) {
      setFotoIndex(fotoIndex + 1);
    } else if (movedBy > 50 && fotoIndex > 0) {
      setFotoIndex(fotoIndex - 1);
    } else {
      /* Retorna à posição atual com animação suave */
      setCurrentTranslate(-fotoIndex * width);
      setPrevTranslate(-fotoIndex * width);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === "imovel-modal-overlay") {
      /* Usa history.back() para consumir o estado empurrado ao abrir o modal.
         O listener de popstate vai chamar onClose(), evitando estado fantasma
         no histórico e eliminando o duplo clique / piscar na tela */
      window.history.back();
    }
  };

  const toggleCurtida = async () => {
    if (!usuario || !usuario.id) {
      showToast("Você precisa fazer login para curtir os imóveis!", "warning");
      return;
    }

    // Permissão: administradores também podem curtir/descurtir imóveis.
    // A API valida (via JWT) que a curtida é feita apenas para o próprio usuário logado.

    try {
      const estaCurtido = curtidas[imovel.id ?? imovel.imovel_id];
      const token = localStorage.getItem("nolare_token");

      const res = await fetch(
        `/api/curtidas/${usuario.id}/${imovel.id ?? imovel.imovel_id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error("Erro ao alternar curtida");

      if (!estaCurtido) {
        setIsHeartAnimating(true);
        setTimeout(() => setIsHeartAnimating(false), 600);
      }

      setCurtidas((prev) => {
        const atualizado = {
          ...prev,
          [imovel.id ?? imovel.imovel_id]: !prev[imovel.id ?? imovel.imovel_id],
        };

        if (
          prev[imovel.id ?? imovel.imovel_id] &&
          !atualizado[imovel.id ?? imovel.imovel_id] &&
          onDescurtir
        ) {
          onDescurtir(imovel.id ?? imovel.imovel_id);
        }

        if (
          !prev[imovel.id ?? imovel.imovel_id] &&
          atualizado[imovel.id ?? imovel.imovel_id] &&
          onCurtir
        ) {
          onCurtir(imovel.id ?? imovel.imovel_id);
        }

        return atualizado;
      });
    } catch (err) {
      console.error(err);
      showToast("Não foi possível curtir/descurtir o imóvel.", "error");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      /* No mobile não exibe mensagem "Link copiado!" - item 1.3 */
      if (!isMobile) {
        setShowCopyMessage(true);
        setTimeout(() => setShowCopyMessage(false), 2000);
      }
    } catch (err) {
      console.error("Erro ao copiar link:", err);
      alert("Não foi possível copiar o link");
    }
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleImovelUpdated = () => {
    setShowEditModal(false);
    onClose();
    // Recarregar dados após edição
    window.location.reload();
  };

  const formatLabel = (key) => {
    if (key === "id" || key === "imovel_id") return null;

    const labels = {
      quarto: "Quartos",
      suite: "Suíte",
      banheiro: "Banheiros",
      vaga: "Vagas",
      andar: "Andar",
      andar_total: "Total de Andares",
      condominio: "Condomínio",
      iptu: "IPTU",
      ar_condicionado: "Ar-Condicionado",
      construtora: "Construtora",
      acessibilidade_pcd: "Acessibilidade PCD",
      aceita_animais: "Aceita Animais",
      academia: "Academia",
      alarme: "Alarme",
      bicicletario: "Bicicletário",
      brinquedoteca: "Brinquedoteca",
      camera_vigilancia: "Câmera de Vigilância",
      carregador_carro_eletrico: "Carregador Carro Elétrico",
      churrasqueira: "Churrasqueira",
      closet: "Closet",
      elevador: "Elevador",
      energia_solar: "Energia Solar",
      escritorio: "Escritório",
      estudio: "Estúdio",
      gerador_energia: "Gerador de Energia",
      interfone: "Interfone",
      jardim: "Jardim",
      lago: "Lago",
      lareira: "Lareira",
      lavanderia: "Lavanderia",
      mobiliado: "Mobiliado",
      na_planta: "Na Planta",
      piscina: "Piscina",
      playground: "Playground",
      pomar: "Pomar",
      portaria_24h: "Portaria 24h",
      quadra: "Quadra",
      sala_jogos: "Sala de Jogos",
      salao_de_festa: "Salão de Festa",
      varanda: "Varanda",
      lancamento: "Lançamento",
      data_entrega: "Data de Entrega",
    };
    return labels[key] || key.replace(/_/g, " ");
  };

  const getCaracteristicaOrder = (key) => {
    const order = {
      mobiliado: 1,

      // Informações básicas
      quarto: 2,
      suite: 3,
      banheiro: 4,
      vaga: 5,

      // Estrutura
      andar: 6,
      andar_total: 7,
      na_planta: 8,
      lancamento: 9,
      data_entrega: 10,

      // Comodidades internas
      ar_condicionado: 11,
      closet: 12,
      escritorio: 13,
      lareira: 14,
      lavanderia: 15,
      estudio: 16,

      // Comodidades do condomínio
      piscina: 17,
      churrasqueira: 18,
      salao_de_festa: 19,
      academia: 20,
      playground: 21,
      quadra: 22,
      sala_jogos: 23,
      brinquedoteca: 24,

      // Áreas externas
      jardim: 25,
      varanda: 26,
      pomar: 27,
      lago: 28,

      // Segurança
      portaria_24h: 29,
      interfone: 30,
      alarme: 31,
      camera_vigilancia: 32,

      // Acessibilidade e facilidades
      elevador: 33,
      acessibilidade_pcd: 34,
      bicicletario: 35,
      aceita_animais: 36,

      // Sustentabilidade
      energia_solar: 37,
      carregador_carro_eletrico: 38,
      gerador_energia: 39,

      // Custos
      condominio: 40,
      iptu: 41,

      // Outros
      construtora: 42,
    };
    return order[key] || 999;
  };

  const imovelId = imovel.id ?? imovel.imovel_id;
  const mapEmbedUrl = getMapEmbedUrl();

  return (
    <div className="imovel-modal-overlay" onClick={handleOverlayClick}>
      <div className="imovel-modal-container">
        {/* Header with close and share buttons */}
        <div className="imovel-modal-header">
          {usuario && usuario.tipo_usuario === "adm" && (
            <button
              className="imovel-modal-edit-btn"
              onClick={handleEditClick}
              title="Editar imóvel"
            >
              <IoPencil size={22} />
            </button>
          )}
          <button
            className="imovel-modal-share-btn"
            onClick={handleShare}
            title="Compartilhar"
          >
            <IoShareSocialOutline size={22} />
          </button>
          <button
            className="imovel-modal-close-btn"
            onClick={() => window.history.back()}
            title="Fechar"
          >
            <IoClose size={28} />
          </button>
        </div>

        {showCopyMessage && (
          <div className="imovel-copy-notification">Link copiado!</div>
        )}

        <div className="imovel-modal-content">
          {/* Gallery Section */}
          <div className="imovel-gallery-section">
            <div
              className="imovel-gallery-main"
              ref={galleryRef}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
            >
              {fotos.length > 0 ? (
                <>
                  <div
                    className="imovel-gallery-track"
                    style={{
                      transform: `translateX(${currentTranslate}px)`,
                      transition: isDragging
                        ? "none"
                        : "transform 0.32s cubic-bezier(0.22, 0.9, 0.2, 1)",
                    }}
                  >
                    {fotos.map((foto, index) => (
                      <div key={index} className="imovel-gallery-slide">
                        <img
                          src={sanitizarUrlFoto(foto.caminho_foto)}
                          alt={`Foto ${index + 1}`}
                          className="imovel-gallery-image"
                          loading={index <= 1 ? "eager" : "lazy"}
                          decoding="async"
                          onError={() =>
                            index === fotoIndex && setImageError(true)
                          }
                          style={{
                            display:
                              imageError && index === fotoIndex
                                ? "none"
                                : "block",
                          }}
                        />
                        {imageError && index === fotoIndex && (
                          <div className="imovel-image-error">
                            Erro ao carregar imagem
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Navigation arrows - desktop only */}
                  {!isMobile && (
                    <>
                      <button
                        className={`imovel-gallery-arrow imovel-gallery-arrow-prev ${
                          fotoIndex === 0 ? "disabled" : ""
                        }`}
                        onClick={handlePrev}
                        disabled={fotoIndex === 0}
                        aria-label="Foto anterior"
                      >
                        🡰
                      </button>
                      <button
                        className={`imovel-gallery-arrow imovel-gallery-arrow-next ${
                          fotoIndex === fotos.length - 1 ? "disabled" : ""
                        }`}
                        onClick={handleNext}
                        disabled={fotoIndex === fotos.length - 1}
                        aria-label="Próxima foto"
                      >
                        🡲
                      </button>
                    </>
                  )}

                  {/* Photo counter */}
                  <div className="imovel-photo-counter">
                    {fotoIndex + 1} / {fotos.length}
                  </div>

                  {/* Dots indicator - mobile only */}
                  {isMobile && (
                    <div className="imovel-gallery-dots">
                      {fotos.map((_, index) => (
                        <div
                          key={index}
                          className={`imovel-gallery-dot ${
                            index === fotoIndex ? "active" : ""
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="imovel-no-photos">
                  <IoHomeOutline size={48} />
                  <p>Sem fotos disponíveis</p>
                </div>
              )}
            </div>

            {/* Thumbnails - desktop only */}
            {!isMobile && fotos.length > 0 && (
              <div className="imovel-gallery-thumbnails" ref={thumbnailsRef}>
                {fotos.map((foto, index) => (
                  <button
                    key={index}
                    className={`imovel-thumbnail ${
                      index === fotoIndex ? "active" : ""
                    }`}
                    onClick={() => setFotoIndex(index)}
                    aria-label={`Ver foto ${index + 1}`}
                  >
                    <img
                      src={sanitizarUrlFoto(foto.caminho_foto)}
                      alt={`Miniatura ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="imovel-info-section">
            <div className="imovel-info-scroll">
              {/* Title and Price */}
              <div className="imovel-header-card">
                <div className="imovel-title-row">
                  <h1 className="imovel-title">
                    {imovel.titulo}
                    <span className="imovel-id-inline">#{imovelId}</span>
                  </h1>
                </div>
                <div className="imovel-price-container">
                  {imovel.preco_destaque && imovel.preco_destaque > 0 ? (
                    <>
                      <div className="imovel-price-original">
                        R$ {formatPrice(imovel.preco)}
                      </div>
                      <div className="imovel-price-discount">
                        R$ {formatPrice(imovel.preco_destaque)}
                      </div>
                    </>
                  ) : (
                    <div className="imovel-price">
                      R$ {formatPrice(imovel.preco)}
                    </div>
                  )}
                </div>
                <div className="imovel-meta-tags">
                  {imovel.tipo && (
                    <span className="imovel-meta-tag">{imovel.tipo}</span>
                  )}
                  {imovel.finalidade && (
                    <span className="imovel-meta-tag">{imovel.finalidade}</span>
                  )}
                  {imovel.status && (
                    <span className="imovel-meta-tag">{imovel.status}</span>
                  )}
                  {caracteristicas?.lancamento && (
                    <span className="imovel-meta-tag imovel-meta-lancamento">
                      Lançamento
                    </span>
                  )}
                </div>
                {caracteristicas?.data_entrega && (
                  <div className="imovel-entrega-info">
                    📅 Previsão de entrega:{" "}
                    {new Date(caracteristicas.data_entrega).toLocaleDateString(
                      "pt-BR",
                      {
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              {imovel.descricao && (
                <div className="imovel-info-card">
                  <h3 className="imovel-card-title">Descrição</h3>
                  <p className="imovel-description">{imovel.descricao}</p>
                </div>
              )}

              {/* Quick Info */}
              {(imovel.area_total || imovel.area_construida) && (
                <div className="imovel-info-card">
                  <h3 className="imovel-card-title">Área</h3>
                  <div className="imovel-info-grid">
                    {imovel.area_total && (
                      <div className="imovel-info-item">
                        <span className="imovel-info-label">Total</span>
                        <span className="imovel-info-value">
                          {imovel.area_total} m²
                        </span>
                      </div>
                    )}
                    {imovel.area_construida && (
                      <div className="imovel-info-item">
                        <span className="imovel-info-label">Construída</span>
                        <span className="imovel-info-value">
                          {imovel.area_construida} m²
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Characteristics */}
              {caracteristicas && Object.keys(caracteristicas).length > 0 && (
                <div className="imovel-info-card">
                  <h3 className="imovel-card-title">Características</h3>
                  <div className="imovel-features-grid">
                    {Object.entries(caracteristicas)
                      .sort(([keyA], [keyB]) => {
                        return (
                          getCaracteristicaOrder(keyA) -
                          getCaracteristicaOrder(keyB)
                        );
                      })
                      .map(([key, value]) => {
                        if (
                          key === "id" ||
                          key === "imovel_id" ||
                          key === "lancamento" ||
                          key === "data_entrega"
                        )
                          return null;
                        if (
                          (key === "condominio" || key === "iptu") &&
                          (!value || value === 0)
                        ) {
                          return null;
                        }
                        if (key === "mobiliado" && value === false) {
                          return (
                            <span key={key} className="imovel-feature-badge">
                              Não Mobiliado
                            </span>
                          );
                        }
                        if (
                          value === null ||
                          value === undefined ||
                          value === false
                        )
                          return null;

                        const label = formatLabel(key);
                        if (!label) return null;

                        if (typeof value === "boolean" && value === true) {
                          return (
                            <span key={key} className="imovel-feature-badge">
                              {label}
                            </span>
                          );
                        }

                        if (
                          typeof value === "number" ||
                          (typeof value === "string" && value.trim() !== "")
                        ) {
                          return (
                            <span key={key} className="imovel-feature-badge">
                              {label}: {value}
                            </span>
                          );
                        }

                        return null;
                      })}
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="imovel-info-card">
                <h3 className="imovel-card-title">
                  <IoLocationOutline size={20} />
                  Localização
                </h3>
                <div className="imovel-location-grid">
                  {imovel.cep && (
                    <div className="imovel-location-item">
                      <span className="imovel-info-label">CEP</span>
                      <span className="imovel-info-value">{imovel.cep}</span>
                    </div>
                  )}
                  {imovel.cidade && (
                    <div className="imovel-location-item">
                      <span className="imovel-info-label">Cidade</span>
                      <span className="imovel-info-value">{imovel.cidade}</span>
                    </div>
                  )}
                  {imovel.bairro && (
                    <div className="imovel-location-item">
                      <span className="imovel-info-label">Bairro</span>
                      <span className="imovel-info-value">{imovel.bairro}</span>
                    </div>
                  )}
                  {imovel.estado && (
                    <div className="imovel-location-item">
                      <span className="imovel-info-label">Estado</span>
                      <span className="imovel-info-value">{imovel.estado}</span>
                    </div>
                  )}
                </div>
                {mapEmbedUrl && (
                  <div className="imovel-map-container">
                    <iframe
                      src={mapEmbedUrl}
                      className="imovel-map-iframe"
                      allowFullScreen
                      loading="lazy"
                      title="Localização do imóvel"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Espaço reservado para os botões fixos não cobrirem o conteúdo no mobile - item 1.1 */}
            {isMobile && <div className="imovel-actions-spacer" />}

            {/* Action Buttons - fixos no fundo no mobile - item 1.1 */}
            <div className="imovel-actions">
              <button
                className="imovel-contact-btn"
                onClick={() => window.open("https://www.youtube.com", "_blank")}
              >
                Entrar em Contato
              </button>
              <button
                className={`imovel-like-btn ${curtido ? "liked" : ""} ${
                  isHeartAnimating ? "heart-burst" : ""
                }`}
                onClick={toggleCurtida}
                title={curtido ? "Descurtir" : "Curtir"}
              >
                {curtido ? (
                  <AiFillHeart size={26} color="#191970" />
                ) : (
                  <AiOutlineHeart size={26} color="#191970" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <EditarImovel
        showPopup={showEditModal}
        setShowPopup={setShowEditModal}
        imovelId={imovelId}
        onImovelUpdated={handleImovelUpdated}
      />
    </div>
  );
};

export default ImovelModal;
