"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "./Comprar.css";
import ImovelModal from "../../ImovelModal/ImovelModal";
import Destaque from "../../Destaque/Destaque";
import Filtro from "../../Filtro/Filtro";
import { useToast } from "../../Toast/Toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import {
  buildImovelPath,
  extractImovelIdFromSlug,
} from "../../../utils/imovelUrl.js";
import { buildCommercialImovelWhatsAppUrl } from "../../../utils/whatsapp.js";

// SEGURANÇA (2.6): Sanitiza URL de foto para prevenir injeção de protocolo (javascript:, data:, etc.)
const sanitizarUrlFoto = (url) => {
  if (!url || typeof url !== "string") return "";
  const limpa = url.trim();
  if (limpa.startsWith("/") || limpa.startsWith("https://")) {
    return limpa;
  }
  return "";
};

const Comprar = ({ usuario }) => {
  const { showToast } = useToast();
  const [imoveis, setImoveis] = useState([]);
  const [imoveisFiltrados, setImoveisFiltrados] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [imagemAtual, setImagemAtual] = useState({});
  const [imovelSelecionado, setImovelSelecionado] = useState(null);
  const [curtidas, setCurtidas] = useState({});
  const [mensagemSemResultados, setMensagemSemResultados] = useState("");
  const [buscaAvancadaAtiva, setBuscaAvancadaAtiva] = useState(false);
  /* Estado de swipe de imagem por imóvel - animação suave igual ao ImovelModal */
  const [imageSwipeStates, setImageSwipeStates] = useState({});
  /* Detectar dispositivo mobile para habilitar swipe */
  const [isMobile, setIsMobile] = useState(false);
  /* Ref para armazenar estado do gesto por imóvel, sem causar re-renders - correção swipe vs scroll */
  const gestureRefs = useRef({});
  /* Refs para os containers de carousel de cada card - correção swipe iOS Safari */
  const carouselRefs = useRef({});
  const lastFetchIdRef = useRef(0);

  const { slug } = useParams();
  const isAdmin = usuario?.tipo_usuario === "adm";

  const imoveisPorPagina = 15;

  /* Detectar mobile - tarefa 1 */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch all properties
  const fetchImoveis = async () => {
    const token = localStorage.getItem("nolare_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const endpoint = isAdmin
      ? "/api/imoveis?incluirOcultos=true"
      : "/api/imoveis";

    const response = await fetch(endpoint, {
      headers,
      credentials: "same-origin",
    });
    return response.json();
  };

  useEffect(() => {
    const fetchId = ++lastFetchIdRef.current;
    fetchImoveis()
      .then((data) => {
        if (fetchId !== lastFetchIdRef.current) return;
        setImoveis(data);
        setImoveisFiltrados(data);
      })
      .catch((err) => console.error("Erro ao buscar imoveis:", err));
  }, [isAdmin]);

  useEffect(() => {
    const handleImovelUpdated = () => {
      const fetchId = ++lastFetchIdRef.current;
      fetchImoveis()
        .then((data) => {
          if (fetchId !== lastFetchIdRef.current) return;
          setImoveis(data);
          setImoveisFiltrados(data);
        })
        .catch((err) => console.error("Erro ao buscar imoveis:", err));
    };

    window.addEventListener("imovelUpdated", handleImovelUpdated);
    return () => {
      window.removeEventListener("imovelUpdated", handleImovelUpdated);
    };
  }, [isAdmin]);

  useEffect(() => {
    if (slug && imoveis.length > 0) {
      const imovelId = extractImovelIdFromSlug(slug);
      if (!imovelId) return;
      const imovel = imoveis.find((i) => (i.id ?? i.imovel_id) === imovelId);
      if (imovel) {
        setImovelSelecionado(imovel);
      }
    }
  }, [slug, imoveis]);

  // Fetch user likes - só busca se usuario.id existir
  useEffect(() => {
    if (usuario && usuario.id) {
      const token = localStorage.getItem("nolare_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      fetch(`/api/curtidas/${usuario.id}`, {
        headers,
      })
        .then((res) => res.json())
        .then((data) => {
          // Garante que data é um array antes de iterar
          if (Array.isArray(data)) {
            const curtidasMap = {};
            data.forEach((c) => (curtidasMap[c.imovel_id] = true));
            setCurtidas(curtidasMap);
          }
        })
        .catch((err) => console.error("Erro ao buscar curtidas:", err));
    }
  }, [usuario]);

  const handleOpenModal = (imovel) => {
    setImovelSelecionado(imovel);

    // Update URL without navigation to preserve scroll position
    window.history.pushState(null, "", buildImovelPath(imovel));
  };

  const handleCloseModal = () => {
    setImovelSelecionado(null);

    /* Restaura a URL original sem navegar.
       O history.back() já foi acionado pelo ImovelModal (botão X, overlay
       ou botão voltar do navegador/celular), então só precisamos garantir
       que a URL reflita a página atual caso o popstate já tenha rodado. */
    const currentPath = window.location.pathname;
    if (currentPath.startsWith("/imovel/")) {
      window.history.replaceState(null, "", "/comprar");
    }
  };

  // Filter handler
  const handleFiltrar = (filtros) => {
    if (
      Object.keys(filtros).length === 0 ||
      Object.values(filtros).every((v) => !v)
    ) {
      setImoveisFiltrados(imoveis);
      setMensagemSemResultados("");
      setPaginaAtual(1);
      setBuscaAvancadaAtiva(false);
      return;
    }

    const normalizeStr = (s) =>
      s
        ? String(s)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
        : "";

    const filtrados = imoveis.filter((imovel) => {
      let match = true;

      if (
        filtros.tipo &&
        normalizeStr(imovel.tipo) !== normalizeStr(filtros.tipo)
      ) {
        match = false;
      }

      if (
        filtros.finalidade &&
        normalizeStr(imovel.finalidade) !== normalizeStr(filtros.finalidade)
      ) {
        match = false;
      }

      if (filtros.localizacao) {
        const loc = normalizeStr(filtros.localizacao);
        const cidade = normalizeStr(imovel.cidade);
        const bairro = normalizeStr(imovel.bairro);
        if (!cidade.includes(loc) && !bairro.includes(loc)) {
          match = false;
        }
      }

      const precoReal =
        imovel.preco_destaque && imovel.preco_destaque > 0
          ? imovel.preco_destaque
          : imovel.preco;

      if (filtros.precoMin && precoReal < Number.parseFloat(filtros.precoMin)) {
        match = false;
      }
      if (filtros.precoMax && precoReal > Number.parseFloat(filtros.precoMax)) {
        match = false;
      }

      if (
        filtros.areaTotalMin &&
        (imovel.area_total || 0) < Number.parseFloat(filtros.areaTotalMin)
      ) {
        match = false;
      }
      if (
        filtros.areaTotalMax &&
        (imovel.area_total || 0) > Number.parseFloat(filtros.areaTotalMax)
      ) {
        match = false;
      }

      if (
        filtros.areaConstruidaMin &&
        (imovel.area_construida || 0) <
          Number.parseFloat(filtros.areaConstruidaMin)
      ) {
        match = false;
      }
      if (
        filtros.areaConstruidaMax &&
        (imovel.area_construida || 0) >
          Number.parseFloat(filtros.areaConstruidaMax)
      ) {
        match = false;
      }

      if (
        filtros.condominioMin &&
        (imovel.caracteristicas?.condominio || 0) <
          Number.parseFloat(filtros.condominioMin)
      ) {
        match = false;
      }
      if (
        filtros.condominioMax &&
        (imovel.caracteristicas?.condominio || 0) >
          Number.parseFloat(filtros.condominioMax)
      ) {
        match = false;
      }

      if (
        filtros.iptuMin &&
        (imovel.caracteristicas?.iptu || 0) < Number.parseFloat(filtros.iptuMin)
      ) {
        match = false;
      }
      if (
        filtros.iptuMax &&
        (imovel.caracteristicas?.iptu || 0) > Number.parseFloat(filtros.iptuMax)
      ) {
        match = false;
      }

      // Updated lógica para quartos Min/Max
      if (
        filtros.quartosMin &&
        (imovel.caracteristicas?.quarto || 0) <
          Number.parseInt(filtros.quartosMin)
      ) {
        match = false;
      }
      if (
        filtros.quartosMax &&
        (imovel.caracteristicas?.quarto || 0) >
          Number.parseInt(filtros.quartosMax)
      ) {
        match = false;
      }

      // Updated lógica para banheiros Min/Max
      if (
        filtros.banheirosMin &&
        (imovel.caracteristicas?.banheiro || 0) <
          Number.parseInt(filtros.banheirosMin)
      ) {
        match = false;
      }
      if (
        filtros.banheirosMax &&
        (imovel.caracteristicas?.banheiro || 0) >
          Number.parseInt(filtros.banheirosMax)
      ) {
        match = false;
      }

      // Updated lógica para vagas Min/Max
      if (
        filtros.vagasMin &&
        (imovel.caracteristicas?.vaga || 0) < Number.parseInt(filtros.vagasMin)
      ) {
        match = false;
      }
      if (
        filtros.vagasMax &&
        (imovel.caracteristicas?.vaga || 0) > Number.parseInt(filtros.vagasMax)
      ) {
        match = false;
      }

      if (
        filtros.andarMin &&
        (imovel.caracteristicas?.andar || 0) < Number.parseInt(filtros.andarMin)
      ) {
        match = false;
      }
      if (
        filtros.andarMax &&
        (imovel.caracteristicas?.andar || 0) > Number.parseInt(filtros.andarMax)
      ) {
        match = false;
      }

      if (
        filtros.andarTotalMin &&
        (imovel.caracteristicas?.andar_total || 0) <
          Number.parseInt(filtros.andarTotalMin)
      ) {
        match = false;
      }
      if (
        filtros.andarTotalMax &&
        (imovel.caracteristicas?.andar_total || 0) >
          Number.parseInt(filtros.andarTotalMax)
      ) {
        match = false;
      }

      if (
        filtros.construtora &&
        normalizeStr(imovel.caracteristicas?.construtora) !==
          normalizeStr(filtros.construtora)
      ) {
        match = false;
      }

      if (
        filtros.oferta &&
        (!imovel.preco_destaque || imovel.preco_destaque === 0)
      ) {
        match = false;
      }

      if (filtros.lancamento && !imovel.caracteristicas?.lancamento) {
        match = false;
      }

      if (filtros.data_entrega) {
        const dataEntregaFiltro = new Date(filtros.data_entrega + "-01");
        const dataEntregaImovel = imovel.caracteristicas?.data_entrega
          ? new Date(imovel.caracteristicas.data_entrega)
          : null;

        if (!dataEntregaImovel || dataEntregaImovel > dataEntregaFiltro) {
          match = false;
        }
      }

      const caracteristicasBooleanas = [
        "acessibilidade_pcd",
        "aceita_animais",
        "academia",
        "alarme",
        "ar_condicionado",
        "bicicletario",
        "brinquedoteca",
        "camera_vigilancia",
        "carregador_carro_eletrico",
        "churrasqueira",
        "closet",
        "elevador",
        "energia_solar",
        "escritorio",
        "estudio",
        "gerador_energia",
        "interfone",
        "jardim",
        "lago",
        "lareira",
        "lavanderia",
        "mobiliado",
        "na_planta",
        "piscina",
        "playground",
        "pomar",
        "portaria_24h",
        "quadra",
        "sala_jogos",
        "salao_de_festa",
        "suite",
        "varanda",
      ];

      for (const caracteristica of caracteristicasBooleanas) {
        if (filtros[caracteristica]) {
          if (caracteristica === "ar_condicionado") {
            if ((imovel.caracteristicas?.[caracteristica] || 0) <= 0) {
              match = false;
              break;
            }
          } else {
            if (!imovel.caracteristicas?.[caracteristica]) {
              match = false;
              break;
            }
          }
        }
      }

      if (filtros.identificador) {
        const idBuscado = Number.parseInt(filtros.identificador);
        const idImovel = imovel.id ?? imovel.imovel_id;
        if (idImovel !== idBuscado) {
          return false;
        }
        return true;
      }

      return match;
    });

    setImoveisFiltrados(filtrados);
    setPaginaAtual(1);
    setBuscaAvancadaAtiva(true);

    if (filtrados.length === 0) {
      if (filtros.identificador) {
        setMensagemSemResultados(
          `Nenhum imóvel encontrado com o identificador #${filtros.identificador}`,
        );
      } else {
        setMensagemSemResultados(
          "No momento, não encontramos imóveis com essas características, mas estamos trabalhando para trazer novas opções em breve!",
        );
      }
    } else {
      setMensagemSemResultados("");
    }
  };

  // Toggle like/unlike
  const toggleCurtida = async (imovel) => {
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
    // A API já valida via JWT que a curtida só pode ser feita em nome do próprio usuário.

    try {
      const token = localStorage.getItem("nolare_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/curtidas/${usuario.id}/${imovelId}`, {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error("Erro ao alternar curtida");

      const likeBtn = document.querySelector(`[data-imovel-id="${imovelId}"]`);
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

  // Pagination
  const totalPaginas = Math.ceil(imoveisFiltrados.length / imoveisPorPagina);
  const indexInicial = (paginaAtual - 1) * imoveisPorPagina;
  const indexFinal = indexInicial + imoveisPorPagina;
  const imoveisExibidos = imoveisFiltrados.slice(indexInicial, indexFinal);

  const gerarNumerosPaginas = () => {
    const paginas = [];
    const maxPaginasVisiveis = 5;
    let inicio = Math.max(1, paginaAtual - Math.floor(maxPaginasVisiveis / 2));
    const fim = Math.min(totalPaginas, inicio + maxPaginasVisiveis - 1);

    // Ajustar início se fim ultrapassar totalPaginas
    if (fim - inicio + 1 < maxPaginasVisiveis) {
      inicio = Math.max(1, fim - maxPaginasVisiveis + 1);
    }

    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }
    return paginas;
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
        if (!gesture) return;

        // iOS Safari (e alguns Androids antigos): se a gente esperar demais para travar a direção,
        // um swipe diagonal pode aplicar "scroll vertical" + "swipe horizontal" ao mesmo tempo.
        // Aqui travamos a direção no primeiro movimento significativo e, se for horizontal,
        // chamamos preventDefault cedo o suficiente para impedir o scroll de iniciar.
        const touch = e.touches && e.touches[0];
        if (!touch) return;

        const diffX = touch.clientX - gesture.startX;
        const diffY = touch.clientY - gesture.startY;
        const absDiffX = Math.abs(diffX);
        const absDiffY = Math.abs(diffY);

        const LOCK_THRESHOLD = 4; // px: menor para travar cedo e evitar gesto "diagonal" confuso

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

  // Image navigation
  const proximaImagem = (id, total) => {
    setImagemAtual((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % total,
    }));
  };

  const imagemAnterior = (id, total) => {
    setImagemAtual((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) === 0 ? total - 1 : (prev[id] || 0) - 1,
    }));
  };

  // Render type-specific info
  const normalizeStr = (s) =>
    s
      ? String(s)
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
      : "";

  const renderTypeSpecific = (imovel) => {
    const tipoRaw = imovel.tipo ?? imovel.tipo_imovel ?? "";
    const tipo = normalizeStr(tipoRaw);

    const areaTotal = imovel.area_total;
    const areaConstruida = imovel.area_construida;
    const banheiro =
      imovel.caracteristicas?.banheiro ?? imovel.banheiro ?? null;
    const andar = imovel.caracteristicas?.andar ?? imovel.andar ?? null;

    switch (tipo) {
      case "casa":
        return (
          <>
            {areaTotal != null && <div>Área total: {areaTotal} m²</div>}
            {areaConstruida != null && (
              <div>Área construída: {areaConstruida} m²</div>
            )}
          </>
        );
      case "apartamento":
      case "cobertura":
      case "kitnet":
        return (
          <>
            {areaConstruida != null && (
              <div>Área construída: {areaConstruida} m²</div>
            )}
            {andar != null && <div>Andar: {andar}</div>}
          </>
        );
      case "terreno":
      case "sitio":
      case "sítio":
      case "fazenda":
        return (
          <>{areaTotal != null && <div>Área total: {areaTotal} m²</div>}</>
        );
      case "sala comercial":
        return (
          <>
            {areaTotal != null && <div>Área total: {areaTotal} m²</div>}
            {areaConstruida != null && (
              <div>Área construída: {areaConstruida} m²</div>
            )}
            {banheiro != null && <div>🛁 {banheiro} banheiros</div>}
          </>
        );
      case "galpao":
      case "galpão":
        return (
          <>
            {areaTotal != null && <div>Área total: {areaTotal} m²</div>}
            {areaConstruida != null && (
              <div>Área construída: {areaConstruida} m²</div>
            )}
          </>
        );
      default:
        return (
          <>
            {areaTotal != null && <div>Área total: {areaTotal} m²</div>}
            {areaConstruida != null && (
              <div>Área construída: {areaConstruida} m²</div>
            )}
          </>
        );
    }
  };

  const handleMudarPagina = (novaPagina) => {
    setPaginaAtual(novaPagina);
    // UX: ao mudar de pagina via paginacao (Anterior/Proxima/numeros),
    // rola suavemente para o topo (mesmo comportamento do clique na logo do Header).
    // Observacao: usamos requestAnimationFrame para garantir que o scroll aconteca mesmo quando a troca de pagina
    // dispara um re-render imediato (em alguns navegadores o scroll sincrono pode falhar ou ficar inconsistente).
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    if (buscaAvancadaAtiva) {
      setBuscaAvancadaAtiva(false);
    }
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

  return (
    <div className="comprar">
      <Destaque
        usuario={usuario}
        curtidas={curtidas}
        setCurtidas={setCurtidas}
        onImovelClick={handleOpenModal}
      />

      <Filtro
        onFiltrar={handleFiltrar}
        buscaAvancadaAtiva={buscaAvancadaAtiva}
        setBuscaAvancadaAtiva={setBuscaAvancadaAtiva}
      />

      <div className="comprar-seo-text-wrapper">
        <p className="comprar-seo-text">
          Explore uma ampla variedade de imóveis disponíveis e encontre opções
          que se encaixam no que você procura. Compare alternativas, visualize
          detalhes e encontre a opção que realmente faz sentido para você.
        </p>
      </div>

      <main className="properties-section">
        <div className="container">
          {mensagemSemResultados && (
            <div className="sem-resultados">
              <p>{mensagemSemResultados}</p>
            </div>
          )}

          <div
            className="grid-imoveis"
            style={{
              justifyContent:
                imoveisExibidos.length < 3 ? "center" : "flex-start",
            }}
          >
            {imoveisExibidos.map((imovel) => (
              <div
                className={`property-card ${
                  normalizeStr(imovel.status) === "vendido"
                    ? "property-card-vendido"
                    : ""
                } ${imovel.visivel === false ? "property-card-oculto" : ""}`}
                key={imovel.id ?? imovel.imovel_id}
                onClick={() => handleOpenModal(imovel)}
              >
                <div className="image-wrapper">
                  <div className="image-container">
                    {imovel.fotos?.length > 0 ? (
                      /* Carousel com animação suave e bloqueio de swipe conflitante - tarefa 1 */
                      <div
                        className="carousel"
                        ref={(el) => {
                          carouselRefs.current[imovel.id ?? imovel.imovel_id] =
                            el;
                        }}
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
                        {/* Track deslizante com transição suave - tarefa 1 */}
                        <div
                          className="property-image-track"
                          style={{
                            transform: `translateX(${getImageTranslate(imovel.id ?? imovel.imovel_id)}%)`,
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
                              className="property-image"
                              loading="lazy"
                              decoding="async"
                            />
                          ))}
                        </div>
                        <button
                          className="carousel-btn prev"
                          onClick={(e) => {
                            e.stopPropagation();
                            imagemAnterior(
                              imovel.id ?? imovel.imovel_id,
                              imovel.fotos.length,
                            );
                          }}
                        >
                          🡰
                        </button>
                        <button
                          className="carousel-btn next"
                          onClick={(e) => {
                            e.stopPropagation();
                            proximaImagem(
                              imovel.id ?? imovel.imovel_id,
                              imovel.fotos.length,
                            );
                          }}
                        >
                          🡲
                        </button>
                      </div>
                    ) : (
                      <div className="no-image">Sem imagem</div>
                    )}
                  </div>
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
                        <div className="property-price-single">
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
                    {renderTypeSpecific(imovel)}
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
                        window.open(
                          buildCommercialImovelWhatsAppUrl(imovel),
                          "_blank",
                        );
                      }}
                    >
                      Entrar em Contato
                    </button>

                    <button
                      className="like-btn"
                      data-imovel-id={imovel.id ?? imovel.imovel_id}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCurtida(imovel);
                      }}
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

          {totalPaginas > 1 && (
            <div className="pagination">
              <div className="pagination-controls">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() =>
                    handleMudarPagina(Math.max(1, paginaAtual - 1))
                  }
                  disabled={paginaAtual === 1}
                >
                  🡰 Anterior
                </button>

                <div className="pagination-info">
                  Página {paginaAtual} de {totalPaginas}
                </div>

                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() =>
                    handleMudarPagina(Math.min(totalPaginas, paginaAtual + 1))
                  }
                  disabled={paginaAtual === totalPaginas}
                >
                  Próxima 🡲
                </button>
              </div>

              <div className="pagination-numbers">
                {gerarNumerosPaginas().map((numeroPagina) => (
                  <button
                    type="button"
                    key={numeroPagina}
                    className={`page-number-btn ${
                      paginaAtual === numeroPagina ? "active" : ""
                    }`}
                    onClick={() => handleMudarPagina(numeroPagina)}
                  >
                    {numeroPagina}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {imovelSelecionado && (
        <ImovelModal
          imovel={imovelSelecionado}
          usuario={usuario}
          curtidas={curtidas}
          setCurtidas={setCurtidas}
          onClose={handleCloseModal}
          parentPushedHistory={true}
        />
      )}
    </div>
  );
};

export default Comprar;
