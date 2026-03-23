"use client";

import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiHeart,
  FiHome,
  FiMail,
  FiRefreshCw,
  FiShield,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import "./Dashboard.css";

const formatInteger = (value) => {
  return new Intl.NumberFormat("pt-BR").format(Number(value) || 0);
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);
};

const formatDateTime = (dateString) => {
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

const buildLastNDaysIso = (n) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dias = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    dias.push(d.toISOString().slice(0, 10));
  }
  return dias;
};

const fillSeries = (rows, daysIso) => {
  // Importante: o back-end retorna apenas dias que existem no banco.
  // Aqui garantimos que o grafico sempre tenha N dias, preenchendo lacunas com zero.
  const map = {};
  (rows || []).forEach((r) => {
    const dia = String(r.dia || "").slice(0, 10);
    map[dia] = Number(r.count) || 0;
  });

  return daysIso.map((dia) => ({
    dia,
    count: map[dia] ?? 0,
  }));
};

const KpiCard = ({ tone, icon, label, value, sub }) => {
  return (
    <div className={`dash-kpi tone-${tone}`}>
      <div className="dash-kpi-top">
        <div className="dash-kpi-icon" aria-hidden="true">
          {icon}
        </div>
        <div className="dash-kpi-label">{label}</div>
      </div>
      <div className="dash-kpi-value">{value}</div>
      {sub ? <div className="dash-kpi-sub">{sub}</div> : null}
    </div>
  );
};

const SparklineCard = ({ tone, title, series }) => {
  const values = (series || []).map((p) => Number(p.count) || 0);
  const max = Math.max(...values, 1);

  const width = 240;
  const height = 56;
  const padding = 6;

  const points = values.map((v, idx) => {
    const x =
      padding +
      (idx * (width - padding * 2)) / Math.max(1, values.length - 1);
    const y = height - padding - (v / max) * (height - padding * 2);
    return { x, y };
  });

  const d = points
    .map(
      (p, idx) =>
        `${idx === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`,
    )
    .join(" ");

  const ultimo = values[values.length - 1] ?? 0;

  return (
    <div className={`dash-chart tone-${tone}`}>
      <div className="dash-chart-head">
        <div className="dash-chart-title">{title}</div>
        <div className="dash-chart-metric">{formatInteger(ultimo)}</div>
      </div>
      <svg
        className="dash-spark"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${title} nos últimos 14 dias`}
      >
        <path className="dash-spark-line" d={d} fill="none" />
      </svg>
      <div className="dash-chart-foot">Últimos 14 dias</div>
    </div>
  );
};

const BarList = ({ items, emptyLabel = "Sem dados" }) => {
  const list = (items || []).filter((i) => Number(i.value) > 0);
  if (list.length === 0) {
    return <div className="dash-empty">{emptyLabel}</div>;
  }

  const max = Math.max(...list.map((i) => Number(i.value) || 0), 1);

  return (
    <div className="dash-barlist">
      {list.map((item) => {
        const pct = Math.round(((Number(item.value) || 0) / max) * 100);
        return (
          <div key={item.label} className="dash-barrow">
            <div className="dash-barlabel">{item.label}</div>
            <div className="dash-barwrap" aria-hidden="true">
              <div className="dash-bar" style={{ width: `${pct}%` }} />
            </div>
            <div className="dash-barvalue">{formatInteger(item.value)}</div>
          </div>
        );
      })}
    </div>
  );
};

const Dashboard = () => {
  const [resumo, setResumo] = useState(null);
  const [picoUsuarios, setPicoUsuarios] = useState(0);
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  const daysIso14 = useMemo(() => buildLastNDaysIso(14), []);

  const getAuthConfig = () => {
    // Segurança: as rotas do dashboard são protegidas por JWT (Bearer).
    const token = localStorage.getItem("nolare_token");
    return {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };
  };

  const buscarPico = async (data) => {
    try {
      const auth = getAuthConfig();
      const picoRes = await axios.get(`/api/sessoes/pico/${data}`, auth);
      setPicoUsuarios(Number(picoRes.data?.pico) || 0);
    } catch (err) {
      console.error("Erro ao buscar pico de usuários:", err);
      // UX: não bloqueia o dashboard inteiro se o pico falhar.
    }
  };

  const carregarDashboard = async () => {
    setLoading(true);
    setErro("");

    try {
      const auth = getAuthConfig();

      const [resumoRes, picoRes] = await Promise.all([
        axios.get("/api/dashboard/resumo", auth),
        axios.get(`/api/sessoes/pico/${dataSelecionada}`, auth),
      ]);

      setResumo(resumoRes.data);
      setPicoUsuarios(Number(picoRes.data?.pico) || 0);
      setUltimaAtualizacao(new Date().toISOString());
    } catch (err) {
      const status = err?.response?.status;

      if (status === 401) {
        setErro("Sessão expirada. Faça login novamente.");
      } else if (status === 403) {
        setErro("Acesso negado. Apenas administradores podem ver o dashboard.");
      } else {
        setErro(
          "Não foi possível carregar o dashboard agora. Tente novamente em instantes.",
        );
      }

      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usuarios = resumo?.usuarios || {};
  const imoveis = resumo?.imoveis || {};
  const curtidas = resumo?.curtidas || {};
  const sessoes = resumo?.sessoes || {};
  const verificacoes = resumo?.verificacoes || {};
  const emails = resumo?.emails || {};

  const imoveisTotal = (imoveis.visiveis || 0) + (imoveis.ocultos || 0);
  const usuariosOptin = usuarios?.optin_emails?.total || 0;
  const optinPct =
    usuarios.total > 0 ? Math.round((usuariosOptin / usuarios.total) * 100) : 0;

  const serieUsuarios = fillSeries(usuarios.ultimos_14_dias, daysIso14);
  const serieImoveis = fillSeries(imoveis.ultimos_14_dias, daysIso14);
  const serieCurtidas = fillSeries(curtidas.ultimos_14_dias, daysIso14);
  const serieSessoes = fillSeries(sessoes.ultimos_14_dias, daysIso14);

  const topCurtidos = (curtidas.top_5_imoveis || []).slice(0, 5);

  return (
    <div className="dashboard-container dash">
      <header className="dash-header">
        <div className="dash-header-left">
          <div className="dash-kicker">NO LARESC</div>
          <h1 className="dash-title">Dashboard</h1>
          <div className="dash-meta">
            Atualizado: {formatDateTime(ultimaAtualizacao)}
          </div>
        </div>

        <div className="dash-header-right">
          <button
            className="dash-btn dash-btn-primary"
            type="button"
            onClick={carregarDashboard}
            disabled={loading}
            title="Atualizar métricas"
          >
            <FiRefreshCw size={18} />
            {loading ? "Atualizando..." : "Atualizar"}
          </button>

          <button
            className="dash-btn"
            type="button"
            onClick={() => (window.location.href = "/comprar")}
            title="Voltar para Comprar"
          >
            <FiArrowLeft size={18} />
            Voltar
          </button>
        </div>
      </header>

      {erro ? (
        <div className="dash-alert" role="alert">
          <div className="dash-alert-icon" aria-hidden="true">
            <FiAlertTriangle size={18} />
          </div>
          <div className="dash-alert-body">
            <div className="dash-alert-title">Não foi possível carregar</div>
            <div className="dash-alert-msg">{erro}</div>
          </div>
          <button
            className="dash-btn dash-btn-primary"
            type="button"
            onClick={carregarDashboard}
          >
            <FiRefreshCw size={18} />
            Tentar novamente
          </button>
        </div>
      ) : null}

      {loading && !resumo ? (
        <div className="dash-loading">Carregando dashboard...</div>
      ) : (
        <>
          <section className="dash-section">
            <div className="dash-section-head">
              <h2 className="dash-h2">Visão Geral</h2>
              <p className="dash-p">Dados diretos do banco, com segurança admin.</p>
            </div>

            <div className="dash-kpi-grid">
              <KpiCard
                tone="cyan"
                icon={<FiUsers size={18} />}
                label="Usuários (total)"
                value={formatInteger(usuarios.total)}
                sub={`+${formatInteger(usuarios.novos_7d)} nos últimos 7 dias`}
              />
              <KpiCard
                tone="purple"
                icon={<FiShield size={18} />}
                label="Administradores"
                value={formatInteger(usuarios?.tipos?.adm || 0)}
                sub={`Usuários: ${formatInteger(usuarios?.tipos?.user || 0)}`}
              />
              <KpiCard
                tone="lime"
                icon={<FiActivity size={18} />}
                label="Online agora"
                value={formatInteger(sessoes.ativos_agora)}
                sub="Sessões ativas (usuários únicos)"
              />
              <KpiCard
                tone="orange"
                icon={<FiHome size={18} />}
                label="Imóveis (visíveis)"
                value={formatInteger(imoveis.visiveis)}
                sub={`Ocultos: ${formatInteger(imoveis.ocultos)} | Total: ${formatInteger(imoveisTotal)}`}
              />
              <KpiCard
                tone="pink"
                icon={<FiHeart size={18} />}
                label="Curtidas (total)"
                value={formatInteger(curtidas.total)}
                sub="Engajamento acumulado"
              />
              <KpiCard
                tone="red"
                icon={<FiMail size={18} />}
                label="Opt-in e-mails"
                value={`${formatInteger(usuariosOptin)} (${optinPct}%)`}
                sub={`E-mails comerciais (30d): ${formatInteger(emails.comerciais_30d)}`}
              />
            </div>
          </section>

          <section className="dash-section">
            <div className="dash-section-head">
              <h2 className="dash-h2">Crescimento (14 dias)</h2>
              <p className="dash-p">Gráficos reais (cadastros e atividade) do banco.</p>
            </div>

            <div className="dash-charts-4">
              <SparklineCard
                tone="cyan"
                title="Cadastros de usuários"
                series={serieUsuarios}
              />
              <SparklineCard
                tone="orange"
                title="Cadastros de imóveis"
                series={serieImoveis}
              />
              <SparklineCard
                tone="pink"
                title="Curtidas"
                series={serieCurtidas}
              />
              <SparklineCard
                tone="lime"
                title="Logins (usuários únicos)"
                series={serieSessoes}
              />
            </div>
          </section>

          <section className="dash-section">
            <div className="dash-section-head dash-section-head-row">
              <div>
                <h2 className="dash-h2">Sessões</h2>
                <p className="dash-p">
                  Pico diário calculado por simultaneidade (por data).
                </p>
              </div>

              <div className="dash-date">
                <label htmlFor="dash-date-input">Data do pico</label>
                <input
                  id="dash-date-input"
                  type="date"
                  value={dataSelecionada}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const novaData = e.target.value;
                    setDataSelecionada(novaData);
                    buscarPico(novaData);
                  }}
                />
              </div>
            </div>

            <div className="dash-grid-2">
              <div className="dash-panel tone-lime">
                <div className="dash-panel-title">Pico na data</div>
                <div className="dash-big">{formatInteger(picoUsuarios)}</div>
                <div className="dash-muted">
                  Maior número de usuários simultâneos em {dataSelecionada}.
                </div>
              </div>

              <div className="dash-panel tone-cyan">
                <div className="dash-panel-title">Último cadastro (usuário)</div>
                <div className="dash-panel-main">{formatDateTime(usuarios.ultimo_cadastro)}</div>
                <div className="dash-muted">Registro mais recente em `usuarios`.</div>
              </div>
            </div>
          </section>

          <section className="dash-section">
            <div className="dash-section-head">
              <h2 className="dash-h2">Imóveis</h2>
              <p className="dash-p">Distribuições (visíveis) e saúde do cadastro.</p>
            </div>

            <div className="dash-grid-2">
              <div className="dash-panel tone-orange">
                <div className="dash-panel-title">Por status</div>
                <BarList
                  items={Object.entries(imoveis.status || {})
                    .map(([label, value]) => ({ label, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 10)}
                  emptyLabel="Sem status cadastrados"
                />
              </div>

              <div className="dash-panel tone-pink">
                <div className="dash-panel-title">Por finalidade</div>
                <BarList
                  items={Object.entries(imoveis.finalidade || {})
                    .map(([label, value]) => ({ label, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 10)}
                  emptyLabel="Sem finalidades cadastradas"
                />
              </div>

              <div className="dash-panel tone-cyan">
                <div className="dash-panel-title">Top cidades</div>
                <BarList
                  items={(imoveis.top_cidades || []).map((c) => ({
                    label: c.cidade,
                    value: c.count,
                  }))}
                  emptyLabel="Sem cidades cadastradas"
                />
              </div>

              <div className="dash-panel tone-purple">
                <div className="dash-panel-title">Qualidade do cadastro</div>
                <div className="dash-quality">
                  <div className="dash-quality-item">
                    <div className="dash-quality-label">
                      <FiEyeOff size={16} /> Sem fotos
                    </div>
                    <div className="dash-quality-value">
                      {formatInteger(imoveis?.qualidade?.sem_fotos)}
                    </div>
                  </div>
                  <div className="dash-quality-item">
                    <div className="dash-quality-label">
                      <FiTrendingUp size={16} /> Sem características
                    </div>
                    <div className="dash-quality-value">
                      {formatInteger(imoveis?.qualidade?.sem_caracteristicas)}
                    </div>
                  </div>
                  <div className="dash-quality-item">
                    <div className="dash-quality-label">
                      <FiEye size={16} /> Sem coordenadas
                    </div>
                    <div className="dash-quality-value">
                      {formatInteger(imoveis?.qualidade?.sem_coordenadas)}
                    </div>
                  </div>
                  <div className="dash-quality-item">
                    <div className="dash-quality-label">
                      <FiHome size={16} /> Preço médio (visíveis)
                    </div>
                    <div className="dash-quality-value dash-quality-value-small">
                      {formatCurrency(imoveis.media_preco_visiveis)}
                    </div>
                  </div>
                </div>
                <div className="dash-muted dash-mt">
                  Último imóvel cadastrado: {formatDateTime(imoveis.ultimo_cadastro)}
                </div>
              </div>
            </div>
          </section>

          <section className="dash-section">
            <div className="dash-section-head">
              <h2 className="dash-h2">Curtidas</h2>
              <p className="dash-p">
                Top imóveis curtidos (inclui visibilidade para contexto).
              </p>
            </div>

            <div className="dash-panel tone-pink">
              <div className="dash-table">
                <div className="dash-table-head">
                  <div>ID</div>
                  <div>Título</div>
                  <div>Status</div>
                  <div className="dash-right">Curtidas</div>
                </div>

                {topCurtidos.length === 0 ? (
                  <div className="dash-empty">Ainda não há curtidas cadastradas.</div>
                ) : (
                  topCurtidos.map((item) => (
                    <div key={item.imovel_id} className="dash-table-row">
                      <div className="dash-mono">#{item.imovel_id}</div>
                      <div className="dash-ellipsis" title={item.titulo}>
                        {item.titulo}
                      </div>
                      <div>
                        <span
                          className={`dash-badge ${item.visivel ? "is-on" : "is-off"}`}
                        >
                          {item.visivel ? "Visível" : "Oculto"}
                        </span>
                      </div>
                      <div className="dash-right dash-strong">
                        {formatInteger(item.total_curtidas)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="dash-section">
            <div className="dash-section-head">
              <h2 className="dash-h2">Verificações e E-mails</h2>
              <p className="dash-p">Sinais operacionais para suporte e cadastro.</p>
            </div>

            <div className="dash-grid-2">
              <div className="dash-panel tone-red">
                <div className="dash-panel-title">Verificação pendente</div>
                <div className="dash-quality">
                  <div className="dash-quality-item">
                    <div className="dash-quality-label">Pendentes ativas</div>
                    <div className="dash-quality-value">
                      {formatInteger(verificacoes.pendentes_ativas)}
                    </div>
                  </div>
                  <div className="dash-quality-item">
                    <div className="dash-quality-label">Pendentes expiradas</div>
                    <div className="dash-quality-value">
                      {formatInteger(verificacoes.pendentes_expiradas)}
                    </div>
                  </div>
                  <div className="dash-quality-item">
                    <div className="dash-quality-label">Bloqueios ativos</div>
                    <div className="dash-quality-value">
                      {formatInteger(verificacoes.tentativas_bloqueadas)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="dash-panel tone-cyan">
                <div className="dash-panel-title">E-mails comerciais</div>
                <div className="dash-quality">
                  <div className="dash-quality-item">
                    <div className="dash-quality-label">Enviados (total)</div>
                    <div className="dash-quality-value">
                      {formatInteger(emails.comerciais_total)}
                    </div>
                  </div>
                  <div className="dash-quality-item">
                    <div className="dash-quality-label">Enviados (30 dias)</div>
                    <div className="dash-quality-value">
                      {formatInteger(emails.comerciais_30d)}
                    </div>
                  </div>
                  <div className="dash-quality-item">
                    <div className="dash-quality-label">Imóveis em destaque</div>
                    <div className="dash-quality-value">
                      {formatInteger(imoveis.destaque)}
                    </div>
                  </div>
                </div>
                <div className="dash-muted dash-mt">
                  Dica: estes números ajudam a validar campanhas e opt-in.
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
