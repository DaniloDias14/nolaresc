"use client";

import { useState, useEffect, useRef } from "react";
import "./Filtro.css";

const Filtro = ({ onFiltrar, buscaAvancadaAtiva, setBuscaAvancadaAtiva }) => {
  const [buscaAvancada, setBuscaAvancada] = useState(false);
  const localizacaoRef = useRef(null);
  const inputLocalizacaoRef = useRef(null);
  const buscarButtonRef = useRef(null);
  const isSecondClickRef = useRef(false);

  useEffect(() => {
    if (buscaAvancadaAtiva !== undefined) {
      setBuscaAvancada(buscaAvancadaAtiva);
    }
  }, [buscaAvancadaAtiva]);

  const [filtros, setFiltros] = useState({
    tipo: "",
    finalidade: "",
    localizacao: "",
    oferta: false,
    lancamento: false,
    data_entrega: "",
    precoMin: "",
    precoMax: "",
    areaTotalMin: "",
    areaTotalMax: "",
    areaConstruidaMin: "",
    areaConstruidaMax: "",
    condominioMin: "",
    condominioMax: "",
    iptuMin: "",
    iptuMax: "",
    quartosMin: "",
    quartosMax: "",
    banheirosMin: "",
    banheirosMax: "",
    vagasMin: "",
    vagasMax: "",
    andarMin: "",
    andarMax: "",
    andarTotalMin: "",
    andarTotalMax: "",
    construtora: "",
    acessibilidade_pcd: false,
    aceita_animais: false,
    academia: false,
    alarme: false,
    ar_condicionado: false,
    bicicletario: false,
    brinquedoteca: false,
    camera_vigilancia: false,
    carregador_carro_eletrico: false,
    churrasqueira: false,
    closet: false,
    elevador: false,
    energia_solar: false,
    escritorio: false,
    estudio: false,
    gerador_energia: false,
    interfone: false,
    jardim: false,
    lago: false,
    lareira: false,
    lavanderia: false,
    mobiliado: false,
    na_planta: false,
    piscina: false,
    playground: false,
    pomar: false,
    portaria_24h: false,
    quadra: false,
    sala_jogos: false,
    salao_de_festa: false,
    suite: false,
    varanda: false,
  });

  const tiposImovel = [
    "Apartamento",
    "Casa",
    "Chalé",
    "Cobertura",
    "Fazenda",
    "Galpão",
    "Kitnet",
    "Sala comercial",
    "Sítio",
    "Terreno",
  ];

  const finalidades = ["Aluguel", "Temporada", "Venda"];

  const construtoras = [
    "Construfase",
    "Construtora Fontana",
    "Corbetta Construtora",
    "Criciúma Construções",
  ];

  const caracteristicasOrdenadas = [
    { key: "acessibilidade_pcd", label: "Acessibilidade PCD" },
    { key: "aceita_animais", label: "Aceita Animais" },
    { key: "academia", label: "Academia" },
    { key: "alarme", label: "Alarme" },
    { key: "ar_condicionado", label: "Ar-Condicionado" },
    { key: "bicicletario", label: "Bicicletário" },
    { key: "brinquedoteca", label: "Brinquedoteca" },
    { key: "camera_vigilancia", label: "Câmera de Vigilância" },
    { key: "carregador_carro_eletrico", label: "Carregador Carro Elétrico" },
    { key: "churrasqueira", label: "Churrasqueira" },
    { key: "closet", label: "Closet" },
    { key: "elevador", label: "Elevador" },
    { key: "energia_solar", label: "Energia Solar" },
    { key: "escritorio", label: "Escritório" },
    { key: "estudio", label: "Estúdio" },
    { key: "gerador_energia", label: "Gerador de Energia" },
    { key: "interfone", label: "Interfone" },
    { key: "jardim", label: "Jardim" },
    { key: "lago", label: "Lago" },
    { key: "lareira", label: "Lareira" },
    { key: "lavanderia", label: "Lavanderia" },
    { key: "mobiliado", label: "Mobiliado" },
    { key: "na_planta", label: "Na Planta" },
    { key: "oferta", label: "Oferta" },
    { key: "piscina", label: "Piscina" },
    { key: "playground", label: "Playground" },
    { key: "pomar", label: "Pomar" },
    { key: "portaria_24h", label: "Portaria 24h" },
    { key: "quadra", label: "Quadra" },
    { key: "sala_jogos", label: "Sala de Jogos" },
    { key: "salao_de_festa", label: "Salão de Festa" },
    { key: "suite", label: "Suíte" },
    { key: "varanda", label: "Varanda" },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    const camposNumericos = [
      "precoMin",
      "precoMax",
      "areaTotalMin",
      "areaTotalMax",
      "areaConstruidaMin",
      "areaConstruidaMax",
      "condominioMin",
      "condominioMax",
      "iptuMin",
      "iptuMax",
      "quartosMin",
      "quartosMax",
      "banheirosMin",
      "banheirosMax",
      "vagasMin",
      "vagasMax",
      "andarMin",
      "andarMax",
      "andarTotalMin",
      "andarTotalMax",
    ];

    if (camposNumericos.includes(name) && type !== "checkbox") {
      const apenasNumeros = value.replace(/[^0-9]/g, "");
      setFiltros((prev) => ({
        ...prev,
        [name]: apenasNumeros,
      }));
      return;
    }

    setFiltros((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBuscar = () => {
    if (isSecondClickRef.current) {
      isSecondClickRef.current = false;
      if (buscaAvancada) {
        setBuscaAvancada(false);
        if (setBuscaAvancadaAtiva) {
          setBuscaAvancadaAtiva(false);
        }
      }
      onFiltrar(filtros);
      return;
    }

    if (buscaAvancada) {
      setBuscaAvancada(false);
      if (setBuscaAvancadaAtiva) {
        setBuscaAvancadaAtiva(false);
      }
    }
    onFiltrar(filtros);

    setTimeout(() => {
      if (buscarButtonRef.current) {
        isSecondClickRef.current = true;
        buscarButtonRef.current.click();
      }
    }, 50);
  };

  const handleLimpar = () => {
    const estadoBuscaAvancada = buscaAvancada;

    const filtrosLimpos = {
      tipo: "",
      finalidade: "",
      localizacao: "",
      oferta: false,
      lancamento: false,
      data_entrega: "",
      precoMin: "",
      precoMax: "",
      areaTotalMin: "",
      areaTotalMax: "",
      areaConstruidaMin: "",
      areaConstruidaMax: "",
      condominioMin: "",
      condominioMax: "",
      iptuMin: "",
      iptuMax: "",
      quartosMin: "",
      quartosMax: "",
      banheirosMin: "",
      banheirosMax: "",
      vagasMin: "",
      vagasMax: "",
      andarMin: "",
      andarMax: "",
      andarTotalMin: "",
      andarTotalMax: "",
      construtora: "",
    };

    caracteristicasOrdenadas.forEach((c) => {
      filtrosLimpos[c.key] = false;
    });

    setFiltros(filtrosLimpos);
    onFiltrar({});

    setTimeout(() => {
      setBuscaAvancada(estadoBuscaAvancada);
      if (setBuscaAvancadaAtiva) {
        setBuscaAvancadaAtiva(estadoBuscaAvancada);
      }
    }, 0);
  };

  const toggleBuscaAvancada = () => {
    const novoEstado = !buscaAvancada;
    setBuscaAvancada(novoEstado);
    if (setBuscaAvancadaAtiva) {
      setBuscaAvancadaAtiva(novoEstado);
    }
  };

  return (
    <div className="filtro-section">
      <div className="filtro-container">
        <div className="filtro-principal">
          <select
            name="tipo"
            value={filtros.tipo}
            onChange={handleInputChange}
            className="filtro-select"
          >
            <option value="">Tipo de Imóvel</option>
            {tiposImovel.map((tipo) => (
              <option key={tipo} value={tipo.toLowerCase()}>
                {tipo}
              </option>
            ))}
          </select>

          <select
            name="finalidade"
            value={filtros.finalidade}
            onChange={handleInputChange}
            className="filtro-select"
          >
            <option value="">Finalidade</option>
            {finalidades.map((finalidade) => (
              <option key={finalidade} value={finalidade.toLowerCase()}>
                {finalidade}
              </option>
            ))}
          </select>

          <input
            ref={inputLocalizacaoRef}
            type="text"
            name="localizacao"
            placeholder="Bairro ou Cidade"
            value={filtros.localizacao}
            onChange={handleInputChange}
            className="filtro-input"
          />

          <button
            ref={buscarButtonRef}
            className="filtro-buscar-btn"
            onClick={handleBuscar}
          >
            Buscar
          </button>
        </div>

        <button
          className="filtro-avancada-toggle"
          onClick={toggleBuscaAvancada}
        >
          {buscaAvancada ? "▲ Busca Simples" : "▼ Busca Avançada"}
        </button>

        {buscaAvancada && (
          <div className="filtro-avancada">
            <div className="filtro-avancada-grid">
              <div className="filtro-group-half">
                <div className="filtro-group">
                  <label>Construtora</label>
                  <select
                    name="construtora"
                    value={filtros.construtora}
                    onChange={handleInputChange}
                    className="filtro-select-compact"
                  >
                    <option value="">Todas</option>
                    {construtoras.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filtro-group">
                  <label>{"   "}Previsão de Entrega</label>
                  <input
                    type="month"
                    name="data_entrega"
                    value={filtros.data_entrega}
                    onChange={handleInputChange}
                    className="filtro-input-compact"
                  />
                </div>
              </div>

              <div className="filtro-group">
                <label>Preço (R$)</label>
                <div className="filtro-range">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="precoMin"
                    placeholder="Mínimo"
                    value={filtros.precoMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="precoMax"
                    placeholder="Máximo"
                    value={filtros.precoMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>

              <div className="filtro-group">
                <label>Vagas de Garagem</label>
                <div className="filtro-range">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="vagasMin"
                    placeholder="Mínimo"
                    value={filtros.vagasMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="vagasMax"
                    placeholder="Máximo"
                    value={filtros.vagasMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>

              <div className="filtro-group">
                <label>Banheiros</label>
                <div className="filtro-range">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="banheirosMin"
                    placeholder="Mínimo"
                    value={filtros.banheirosMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="banheirosMax"
                    placeholder="Máximo"
                    value={filtros.banheirosMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>

              <div className="filtro-group">
                <label>Quartos</label>
                <div className="filtro-range">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="quartosMin"
                    placeholder="Mínimo"
                    value={filtros.quartosMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="quartosMax"
                    placeholder="Máximo"
                    value={filtros.quartosMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>

              <div className="filtro-group">
                <label>Condomínio (R$)</label>
                <div className="filtro-range">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="condominioMin"
                    placeholder="Mínimo"
                    value={filtros.condominioMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="condominioMax"
                    placeholder="Máximo"
                    value={filtros.condominioMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>

              <div className="filtro-group">
                <label>IPTU (R$)</label>
                <div className="filtro-range">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="iptuMin"
                    placeholder="Mínimo"
                    value={filtros.iptuMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="iptuMax"
                    placeholder="Máximo"
                    value={filtros.iptuMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>

              <div className="filtro-group">
                <label>Área Construída (m²)</label>
                <div className="filtro-range">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="areaConstruidaMin"
                    placeholder="Mínima"
                    value={filtros.areaConstruidaMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="areaConstruidaMax"
                    placeholder="Máxima"
                    value={filtros.areaConstruidaMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>

              <div className="filtro-group">
                <label>Área Total (m²)</label>
                <div className="filtro-range">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="areaTotalMin"
                    placeholder="Mínima"
                    value={filtros.areaTotalMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="areaTotalMax"
                    placeholder="Máxima"
                    value={filtros.areaTotalMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>

              <div className="filtro-group">
                <label>Andar</label>
                <div className="filtro-range">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="andarMin"
                    placeholder="Mínimo"
                    value={filtros.andarMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="andarMax"
                    placeholder="Máximo"
                    value={filtros.andarMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>

              <div className="filtro-group">
                <label>Total de Andares</label>
                <div className="filtro-range">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="andarTotalMin"
                    placeholder="Mínimo"
                    value={filtros.andarTotalMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="andarTotalMax"
                    placeholder="Máximo"
                    value={filtros.andarTotalMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>
            </div>

            <div className="filtro-amenidades">
              <h4>Características</h4>
              <div className="filtro-checkbox-grid">
                {caracteristicasOrdenadas.map((caracteristica) => (
                  <label key={caracteristica.key} className="filtro-checkbox">
                    <input
                      type="checkbox"
                      name={caracteristica.key}
                      checked={filtros[caracteristica.key]}
                      onChange={handleInputChange}
                    />
                    <span>{caracteristica.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="filtro-limpar-btn" onClick={handleLimpar}>
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filtro;
