"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Comprar.css";
import ImovelModal from "../../ImovelModal/ImovelModal";
import Destaque from "../../Destaque/Destaque";
import Filtro from "../../Filtro/Filtro";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const Comprar = ({ usuario }) => {
  const [imoveis, setImoveis] = useState([]);
  const [imoveisFiltrados, setImoveisFiltrados] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [imagemAtual, setImagemAtual] = useState({});
  const [imovelSelecionado, setImovelSelecionado] = useState(null);
  const [curtidas, setCurtidas] = useState({});
  const [mensagemSemResultados, setMensagemSemResultados] = useState("");
  const [buscaAvancadaAtiva, setBuscaAvancadaAtiva] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const imoveisPorPagina = 15;

  // Fetch all properties
  useEffect(() => {
    fetch("http://localhost:5000/api/imoveis")
      .then((res) => res.json())
      .then((data) => {
        setImoveis(data);
        setImoveisFiltrados(data);
      })
      .catch((err) => console.error("Erro ao buscar imóveis:", err));
  }, []);

  useEffect(() => {
    const handleImovelUpdated = () => {
      fetch("http://localhost:5000/api/imoveis")
        .then((res) => res.json())
        .then((data) => {
          setImoveis(data);
          setImoveisFiltrados(data);
        })
        .catch((err) => console.error("Erro ao buscar imóveis:", err));
    };

    window.addEventListener("imovelUpdated", handleImovelUpdated);
    return () => {
      window.removeEventListener("imovelUpdated", handleImovelUpdated);
    };
  }, []);

  useEffect(() => {
    if (id && imoveis.length > 0) {
      const imovelId = Number.parseInt(id);
      const imovel = imoveis.find((i) => (i.id ?? i.imovel_id) === imovelId);
      if (imovel) {
        setImovelSelecionado(imovel);
      }
    }
  }, [id, imoveis]);

  // Fetch user likes
  useEffect(() => {
    if (usuario) {
      fetch(`http://localhost:5000/api/curtidas/${usuario.id}`)
        .then((res) => res.json())
        .then((data) => {
          const curtidasMap = {};
          data.forEach((c) => (curtidasMap[c.imovel_id] = true));
          setCurtidas(curtidasMap);
        })
        .catch((err) => console.error("Erro ao buscar curtidas:", err));
    }
  }, [usuario]);

  const handleOpenModal = (imovel) => {
    const imovelId = imovel.id ?? imovel.imovel_id;
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
          `Nenhum imóvel encontrado com o identificador #${filtros.identificador}`
        );
      } else {
        setMensagemSemResultados(
          "No momento, não encontramos imóveis com essas características, mas estamos trabalhando para trazer novas opções em breve!"
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

    if (!usuario) {
      alert("Você precisa fazer login para curtir os imóveis!");
      return;
    }

    if (usuario.tipo_usuario === "adm") {
      alert("Administradores não podem curtir imóveis.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/curtidas/${usuario.id}/${imovelId}`,
        { method: "POST" }
      );
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
      alert("Não foi possível curtir/descurtir o imóvel.");
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
                className="property-card"
                key={imovel.id ?? imovel.imovel_id}
                onClick={() => handleOpenModal(imovel)}
              >
                <div className="image-wrapper">
                  <div className="image-container">
                    {imovel.fotos?.length > 0 ? (
                      <div className="carousel">
                        <button
                          className="carousel-btn prev"
                          onClick={(e) => {
                            e.stopPropagation();
                            imagemAnterior(
                              imovel.id ?? imovel.imovel_id,
                              imovel.fotos.length
                            );
                          }}
                        >
                          🡰
                        </button>
                        <img
                          src={
                            imovel.fotos[
                              imagemAtual[imovel.id ?? imovel.imovel_id] || 0
                            ]?.caminho_foto
                          }
                          alt={imovel.titulo}
                          className="property-image"
                        />
                        <button
                          className="carousel-btn next"
                          onClick={(e) => {
                            e.stopPropagation();
                            proximaImagem(
                              imovel.id ?? imovel.imovel_id,
                              imovel.fotos.length
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
                          imovel.caracteristicas.data_entrega
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
                        window.open("https://www.youtube.com", "_blank");
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
        />
      )}
    </div>
  );
};

export default Comprar;
