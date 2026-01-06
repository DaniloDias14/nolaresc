"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  // State for user statistics
  const [usuariosStats, setUsuariosStats] = useState({
    total: 0,
    tipos: {},
    ultimo_cadastro: null,
  });

  // State for property statistics
  const [imoveisStats, setImoveisStats] = useState({
    total: 0,
    media_preco: 0,
    ultimo_cadastro: null,
    destaque: 0,
    status: {},
    finalidade: {},
    tipo: {},
    construtora: {},
  });

  const [imovelMaisCurtido, setImovelMaisCurtido] = useState({
    imovel_id: null,
    titulo: null,
    total_curtidas: 0,
  });

  // State for session statistics
  const [usuariosAtivos, setUsuariosAtivos] = useState(0);
  const [picoUsuarios, setPicoUsuarios] = useState(0);
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(true);

  // Fetch all statistics on component mount
  useEffect(() => {
    fetchAllStats();
  }, []);

  // Fetch peak users when date changes
  useEffect(() => {
    fetchPicoUsuarios();
  }, [dataSelecionada]);

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      // Fetch user statistics
      const usuariosRes = await axios.get("/api/estatisticas/usuarios");
      setUsuariosStats(usuariosRes.data);

      // Fetch property statistics
      const imoveisRes = await axios.get("/api/estatisticas/imoveis");
      setImoveisStats(imoveisRes.data);

      // Fetch active users
      const ativosRes = await axios.get("/api/sessoes/ativos");
      setUsuariosAtivos(ativosRes.data.count);

      const maisCurtidoRes = await axios.get(
        "/api/estatisticas/imovel-mais-curtido"
      );
      setImovelMaisCurtido(maisCurtidoRes.data);

      // Fetch peak users for today
      await fetchPicoUsuarios();
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPicoUsuarios = async () => {
    try {
      const picoRes = await axios.get(`/api/sessoes/pico/${dataSelecionada}`);
      setPicoUsuarios(picoRes.data.pico);
    } catch (error) {
      console.error("Erro ao buscar pico de usuários:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Carregando estatísticas...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* User Statistics Section */}
      <section className="dashboard-section">
        <h2 className="section-title">Estatísticas de Usuários</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon user-icon">👥</div>
            <div className="stat-content">
              <h3>Total de Usuários</h3>
              <p className="stat-value">{usuariosStats.total}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon admin-icon">👨‍💼</div>
            <div className="stat-content">
              <h3>Administradores</h3>
              <p className="stat-value">{usuariosStats.tipos.adm || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon user-icon">👤</div>
            <div className="stat-content">
              <h3>Usuários Comuns</h3>
              <p className="stat-value">{usuariosStats.tipos.user || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon calendar-icon">📅</div>
            <div className="stat-content">
              <h3>Último Cadastro</h3>
              <p className="stat-value-small">
                {formatDate(usuariosStats.ultimo_cadastro)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Session Statistics Section */}
      <section className="dashboard-section">
        <h2 className="section-title">Sessões Ativas</h2>
        <div className="stats-grid">
          <div className="stat-card highlight">
            <div className="stat-icon online-icon">🟢</div>
            <div className="stat-content">
              <h3>Usuários Online Agora</h3>
              <p className="stat-value">{usuariosAtivos}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon chart-icon">📊</div>
            <div className="stat-content">
              <h3>Pico de Usuários</h3>
              <p className="stat-value">{picoUsuarios}</p>
              <div className="date-picker-container">
                <label htmlFor="date-picker">Data:</label>
                <input
                  id="date-picker"
                  type="date"
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Statistics Section */}
      <section className="dashboard-section">
        <h2 className="section-title">Estatísticas de Imóveis</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon home-icon">🏠</div>
            <div className="stat-content">
              <h3>Total de Imóveis</h3>
              <p className="stat-value">{imoveisStats.total}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon money-icon">💰</div>
            <div className="stat-content">
              <h3>Preço Médio</h3>
              <p className="stat-value-small">
                {formatCurrency(imoveisStats.media_preco)}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon star-icon">⭐</div>
            <div className="stat-content">
              <h3>Imóveis em Destaque</h3>
              <p className="stat-value">{imoveisStats.destaque}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon calendar-icon">📅</div>
            <div className="stat-content">
              <h3>Última Postagem</h3>
              <p className="stat-value-small">
                {formatDate(imoveisStats.ultimo_cadastro)}
              </p>
            </div>
          </div>
        </div>

        <div className="subsection">
          <h3 className="subsection-title">Imóvel Mais Curtido</h3>
          <div className="stats-grid-small">
            <div className="stat-card-small highlight">
              <h4>
                {imovelMaisCurtido.titulo
                  ? `ID: ${imovelMaisCurtido.imovel_id}`
                  : "Nenhum imóvel curtido"}
              </h4>
              <p className="stat-value">
                {imovelMaisCurtido.total_curtidas} curtidas
              </p>
              {imovelMaisCurtido.titulo && (
                <p className="stat-subtitle">{imovelMaisCurtido.titulo}</p>
              )}
            </div>
          </div>
        </div>

        {/* Property Status */}
        <div className="subsection">
          <h3 className="subsection-title">Por Status</h3>
          <div className="stats-grid-small">
            <div className="stat-card-small">
              <h4>Disponível</h4>
              <p className="stat-value">
                {imoveisStats.status.disponivel || 0}
              </p>
            </div>
            <div className="stat-card-small">
              <h4>Vendido</h4>
              <p className="stat-value">{imoveisStats.status.vendido || 0}</p>
            </div>
          </div>
        </div>

        {/* Property Purpose */}
        <div className="subsection">
          <h3 className="subsection-title">Por Finalidade</h3>
          <div className="stats-grid-small">
            <div className="stat-card-small">
              <h4>Venda</h4>
              <p className="stat-value">{imoveisStats.finalidade.venda || 0}</p>
            </div>
            <div className="stat-card-small">
              <h4>Aluguel</h4>
              <p className="stat-value">
                {imoveisStats.finalidade.aluguel || 0}
              </p>
            </div>
            <div className="stat-card-small">
              <h4>Temporada</h4>
              <p className="stat-value">
                {imoveisStats.finalidade.temporada || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Property Type */}
        <div className="subsection">
          <h3 className="subsection-title">Por Tipo</h3>
          <div className="stats-grid-small">
            {Object.entries(imoveisStats.tipo).map(([tipo, count]) => (
              <div key={tipo} className="stat-card-small">
                <h4>{tipo}</h4>
                <p className="stat-value">{count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Property by Builder */}
        <div className="subsection">
          <h3 className="subsection-title">Por Construtora</h3>
          <div className="stats-grid-small">
            {Object.entries(imoveisStats.construtora).map(
              ([construtora, count]) => (
                <div key={construtora} className="stat-card-small">
                  <h4>{construtora}</h4>
                  <p className="stat-value">{count}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <button
        className="return-home-btn"
        onClick={() => (window.location.href = "/comprar")}
      >
        Voltar para Página Inicial
      </button>
    </div>
  );
};

export default Dashboard;
