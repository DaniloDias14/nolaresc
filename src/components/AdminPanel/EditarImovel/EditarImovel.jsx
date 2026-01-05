"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import "./EditarImovel.css";

const booleanFields = [
  "acessibilidade_pcd",
  "aceita_animais",
  "academia",
  "alarme",
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
  "playground",
  "piscina",
  "pomar",
  "portaria_24h",
  "quadra",
  "sala_jogos",
  "salao_de_festa",
  "suite",
  "varanda",
  "lancamento",
];

const estados = ["Santa Catarina"];
const cidades = [
  "Araranguá",
  "Balneário Arroio do Silva",
  "Criciúma",
  "Forquilhinha",
  "Içara",
  "Morro da Fumaça",
  "Nova Veneza",
  "Siderópolis",
  "Urussanga",
];
const finalidades = ["Aluguel", "Temporada", "Venda"];
const construtoras = [
  "Construfase",
  "Construtora Fontana",
  "Corbetta Construtora",
  "Criciúma Construções",
];

const EditarImovel = ({
  showPopup,
  setShowPopup,
  imovelId,
  onImovelUpdated,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [existingFotos, setExistingFotos] = useState([]);
  const [fotosToRemove, setFotosToRemove] = useState([]);
  const [updatedImovelId, setUpdatedImovelId] = useState(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    preco: "",
    preco_destaque: "",
    tipo: "",
    status: "",
    finalidade: "",
    destaque: false,
    visivel: true,
    cep: "",
    estado: "",
    cidade: "",
    bairro: "",
    area_total: "",
    area_construida: "",
    fotos: Array(10).fill(null),
    coordenadas: "",
    condominio: "",
    iptu: "",
    quarto: "",
    suite: false,
    banheiro: "",
    vaga: "",
    andar: "",
    andar_total: "",
    piscina: false,
    churrasqueira: false,
    salao_de_festa: false,
    academia: false,
    playground: false,
    jardim: false,
    varanda: false,
    interfone: false,
    acessibilidade_pcd: false,
    mobiliado: false,
    ar_condicionado: "",
    energia_solar: false,
    quadra: false,
    lavanderia: false,
    closet: false,
    escritorio: false,
    lareira: false,
    alarme: false,
    camera_vigilancia: false,
    bicicletario: false,
    sala_jogos: false,
    brinquedoteca: false,
    elevador: false,
    pomar: false,
    lago: false,
    aceita_animais: false,
    construtora: "",
    portaria_24h: false,
    carregador_carro_eletrico: false,
    gerador_energia: false,
    estudio: false,
    na_planta: false,
    lancamento: false,
    data_entrega: "",
  });

  useEffect(() => {
    if (!showPopup || !imovelId) {
      setIsLoading(false);
      return;
    }

    const carregarImovel = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/imoveis/${imovelId}`
        );
        const imovel = res.data;
        const caracteristicas = imovel.caracteristicas || {};

        // Formata data de entrega
        let dataEntrega = "";
        if (caracteristicas.data_entrega) {
          const date = new Date(caracteristicas.data_entrega);
          dataEntrega = date.toISOString().slice(0, 7);
        }

        setExistingFotos(imovel.fotos || []);

        // Preenche o formulário
        setFormData({
          titulo: imovel.titulo || "",
          descricao: imovel.descricao || "",
          preco: formatCurrency(imovel.preco?.toString() || "0"),
          preco_destaque: imovel.preco_destaque
            ? formatCurrency(imovel.preco_destaque.toString())
            : "",
          tipo: imovel.tipo || "",
          status: imovel.status?.toLowerCase() || "",
          finalidade: imovel.finalidade?.toLowerCase() || "",
          destaque: imovel.destaque || false,
          visivel: imovel.visivel ?? true,
          cep: imovel.cep || "",
          estado: imovel.estado || "",
          cidade: imovel.cidade || "",
          bairro: imovel.bairro || "",
          area_total: imovel.area_total?.toString() || "",
          area_construida: imovel.area_construida?.toString() || "",
          fotos: Array(10).fill(null),
          coordenadas: imovel.coordenadas || "",
          condominio: caracteristicas.condominio
            ? formatCurrency(caracteristicas.condominio.toString())
            : "",
          iptu: caracteristicas.iptu
            ? formatCurrency(caracteristicas.iptu.toString())
            : "",
          quarto: caracteristicas.quarto?.toString() || "",
          suite: caracteristicas.suite || false,
          banheiro: caracteristicas.banheiro?.toString() || "",
          vaga: caracteristicas.vaga?.toString() || "",
          andar: caracteristicas.andar?.toString() || "",
          andar_total: caracteristicas.andar_total?.toString() || "",
          piscina: caracteristicas.piscina || false,
          churrasqueira: caracteristicas.churrasqueira || false,
          salao_de_festa: caracteristicas.salao_de_festa || false,
          academia: caracteristicas.academia || false,
          playground: caracteristicas.playground || false,
          jardim: caracteristicas.jardim || false,
          varanda: caracteristicas.varanda || false,
          interfone: caracteristicas.interfone || false,
          acessibilidade_pcd: caracteristicas.acessibilidade_pcd || false,
          mobiliado: caracteristicas.mobiliado || false,
          ar_condicionado: caracteristicas.ar_condicionado?.toString() || "",
          energia_solar: caracteristicas.energia_solar || false,
          quadra: caracteristicas.quadra || false,
          lavanderia: caracteristicas.lavanderia || false,
          closet: caracteristicas.closet || false,
          escritorio: caracteristicas.escritorio || false,
          lareira: caracteristicas.lareira || false,
          alarme: caracteristicas.alarme || false,
          camera_vigilancia: caracteristicas.camera_vigilancia || false,
          bicicletario: caracteristicas.bicicletario || false,
          sala_jogos: caracteristicas.sala_jogos || false,
          brinquedoteca: caracteristicas.brinquedoteca || false,
          elevador: caracteristicas.elevador || false,
          pomar: caracteristicas.pomar || false,
          lago: caracteristicas.lago || false,
          aceita_animais: caracteristicas.aceita_animais || false,
          construtora: caracteristicas.construtora || "",
          portaria_24h: caracteristicas.portaria_24h || false,
          carregador_carro_eletrico:
            caracteristicas.carregador_carro_eletrico || false,
          gerador_energia: caracteristicas.gerador_energia || false,
          estudio: caracteristicas.estudio || false,
          na_planta: caracteristicas.na_planta || false,
          lancamento: caracteristicas.lancamento || false,
          data_entrega: dataEntrega,
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Erro ao carregar imóvel:", err);
        setErrorMsg("Erro ao carregar dados do imóvel");
        setIsLoading(false);
      }
    };

    carregarImovel();
  }, [showPopup, imovelId]);

  const formatCurrency = (value) => {
    if (!value || value === "0") return "";
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 11);
    if (!limited || limited === "0" || Number.parseInt(limited) === 0) {
      return "";
    }
    const num = Number.parseInt(limited);
    const intPart = Math.floor(num / 100).toString();
    const decPart = (num % 100).toString().padStart(2, "0");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedInt},${decPart}`;
  };

  const formatCEP = (value) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 8);
    if (!limited || limited === "0" || Number.parseInt(limited) === 0) {
      return "";
    }
    if (limited.length <= 5) {
      return limited;
    }
    return limited.replace(/(\d{5})(\d{0,3})/, "$1-$2");
  };

  const parseCurrency = (formatted) => {
    const numbers = formatted.replace(/\./g, "").replace(",", ".");
    const num = Number.parseFloat(numbers);
    return isNaN(num) ? 0 : num;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    if (name === "cep") {
      newValue = formatCEP(value);
    }

    if (
      name === "preco" ||
      name === "condominio" ||
      name === "iptu" ||
      name === "preco_destaque"
    ) {
      newValue = formatCurrency(value);
    }

    if (
      [
        "area_total",
        "area_construida",
        "quarto",
        "banheiro",
        "vaga",
        "andar",
        "andar_total",
        "ar_condicionado",
      ].includes(name)
    ) {
      if (!/^\d*$/.test(value) && value !== "") {
        return;
      }
      if (value !== "" && Number.parseFloat(value) < 0) {
        return;
      }
      newValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFotoChange = (index, file) => {
    setFormData((prev) => {
      const newFotos = [...prev.fotos];
      newFotos[index] = file || null;
      return { ...prev, fotos: newFotos };
    });
  };

  const handleRemoveFoto = (index) => {
    setFormData((prev) => {
      const newFotos = [...prev.fotos];
      newFotos[index] = null;
      return { ...prev, fotos: newFotos };
    });
  };

  const handleRemoveExistingFoto = (fotoId) => {
    setFotosToRemove((prev) => [...prev, fotoId]);
    setExistingFotos((prev) => prev.filter((f) => f.id !== fotoId));
  };

  const handleDragStart = (e, index) => {
    const isExistingIndex = index < existingFotos.length;
    const hasPhoto = isExistingIndex
      ? existingFotos[index]
      : formData.fotos[index - existingFotos.length];

    if (!hasPhoto) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedIndexStr = e.dataTransfer.getData("text/plain");

    if (draggedIndexStr !== "" && draggedIndex !== null) {
      const draggedIdx = Number.parseInt(draggedIndexStr, 10);

      if (draggedIdx === index) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      const totalExisting = existingFotos.length;
      const isDraggingExisting = draggedIdx < totalExisting;
      const isDroppingOnExisting = index < totalExisting;

      if (isDraggingExisting && isDroppingOnExisting) {
        // Reorganiza fotos existentes
        setExistingFotos((prev) => {
          const newFotos = [...prev];
          const temp = newFotos[draggedIdx];
          newFotos[draggedIdx] = newFotos[index];
          newFotos[index] = temp;
          return newFotos;
        });
      } else if (!isDraggingExisting && !isDroppingOnExisting) {
        // Reorganiza novas fotos
        setFormData((prev) => {
          const newFotos = [...prev.fotos];
          const dragIdx = draggedIdx - totalExisting;
          const dropIdx = index - totalExisting;
          const temp = newFotos[dragIdx];
          newFotos[dragIdx] = newFotos[dropIdx];
          newFotos[dropIdx] = temp;
          return { ...prev, fotos: newFotos };
        });
      }

      setDraggedIndex(null);
      setDragOverIndex(null);
    } else {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          const totalExisting = existingFotos.length;
          if (index >= totalExisting) {
            handleFotoChange(index - totalExisting, file);
          }
        } else {
          setErrorMsg(
            "Por favor, arraste apenas arquivos de imagem (JPG, PNG, etc.)"
          );
          setTimeout(() => setErrorMsg(""), 3000);
        }
      }
      setDragOverIndex(null);
    }
  };

  const handleFileDragEnter = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(index);
  };

  const handleFileDragLeave = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOverIndex(null);
  };

  const handleFileDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setActiveTab(1);
    setErrorMsg("");
    setFieldErrors({});
    setExistingFotos([]);
    setFotosToRemove([]);
    setUpdatedImovelId(null); // Reset updatedImovelId
  };

  const parseNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const validateForm = () => {
    const errors = {};
    let firstErrorTab = null;

    if (!formData.titulo || formData.titulo.trim() === "") {
      errors.titulo = "O campo Título é obrigatório";
      if (!firstErrorTab) firstErrorTab = 1;
    }

    if (!formData.descricao || formData.descricao.trim() === "") {
      errors.descricao = "O campo Descrição é obrigatório";
      if (!firstErrorTab) firstErrorTab = 1;
    }

    if (!formData.preco || parseCurrency(formData.preco) === 0) {
      errors.preco = "O campo Preço é obrigatório";
      if (!firstErrorTab) firstErrorTab = 1;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setErrorMsg("Por favor, corrija os erros destacados nos campos abaixo");
      if (firstErrorTab) setActiveTab(firstErrorTab);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setFieldErrors({});

    // Valida o formulário primeiro
    if (!validateForm()) {
      return; // Para aqui se houver erros - não abre o popup
    }

    // Só abre o popup se tudo estiver válido
    setShowConfirmPopup(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmPopup(false);

    let imovelUpdated = false;
    let caracteristicasUpdated = false;
    let fotosUpdated = false;

    try {
      const precoDestaqueValue = parseCurrency(formData.preco_destaque);

      const capitalizeFirst = (str) => {
        if (!str) return null;
        return str.charAt(0).toUpperCase() + str.slice(1);
      };

      const formatStatus = (status) => {
        if (!status) return null;
        if (status.toLowerCase() === "disponivel") return "Disponível";
        if (status.toLowerCase() === "vendido") return "Vendido";
        return capitalizeFirst(status);
      };

      const formatDataEntrega = (dataEntrega) => {
        if (!dataEntrega || dataEntrega.trim() === "") return null;
        if (/^\d{4}-\d{2}$/.test(dataEntrega)) {
          return `${dataEntrega}-01`;
        }
        return dataEntrega;
      };

      const imovelPayload = {
        titulo: formData.titulo || null,
        descricao: formData.descricao || null,
        preco: parseCurrency(formData.preco),
        preco_destaque: precoDestaqueValue === 0 ? null : precoDestaqueValue,
        tipo: formData.tipo || null,
        status: formatStatus(formData.status),
        finalidade: capitalizeFirst(formData.finalidade),
        destaque: !!formData.destaque,
        visivel: formData.visivel ?? true,
        cep: formData.cep || null,
        estado: formData.estado || null,
        cidade: formData.cidade || null,
        bairro: formData.bairro || null,
        area_total: parseNumberOrNull(formData.area_total),
        area_construida: parseNumberOrNull(formData.area_construida),
        atualizado_por: 1,
        coordenadas: formData.coordenadas || null,
      };

      try {
        await axios.put(
          `http://localhost:5000/api/imoveis/${imovelId}`,
          imovelPayload
        );
        imovelUpdated = true;
      } catch (err) {
        console.error("[v0] Erro ao atualizar imóvel principal:", err);
        throw new Error("Erro ao atualizar dados principais do imóvel");
      }

      const condominioValue = parseCurrency(formData.condominio);
      const iptuValue = parseCurrency(formData.iptu);

      const caracteristicasPayload = {
        imovel_id: imovelId,
        condominio: condominioValue === 0 ? null : condominioValue,
        iptu: iptuValue === 0 ? null : iptuValue,
        quarto: parseNumberOrNull(formData.quarto),
        banheiro: parseNumberOrNull(formData.banheiro),
        vaga: parseNumberOrNull(formData.vaga),
        andar: parseNumberOrNull(formData.andar),
        andar_total: parseNumberOrNull(formData.andar_total),
        ar_condicionado: parseNumberOrNull(formData.ar_condicionado),
        construtora: formData.construtora?.trim() || null,
        lancamento: !!formData.lancamento,
        data_entrega: formatDataEntrega(formData.data_entrega),
        ...booleanFields.reduce((acc, f) => {
          acc[f] = !!formData[f];
          return acc;
        }, {}),
      };

      try {
        await axios.put(
          `http://localhost:5000/api/imoveis_caracteristicas/${imovelId}`,
          caracteristicasPayload
        );
        caracteristicasUpdated = true;
      } catch (err) {
        console.error(
          "[v0] Erro ao atualizar características (continuando):",
          err
        );
        // Não lança erro, apenas loga e continua
      }

      for (const fotoId of fotosToRemove) {
        try {
          await axios.delete(`http://localhost:5000/api/fotos/${fotoId}`);
        } catch (err) {
          console.error("[v0] Erro ao deletar foto (continuando):", err);
          // Continua mesmo se falhar
        }
      }

      const formDataFotos = new FormData();
      formData.fotos.forEach((foto) => {
        if (foto) formDataFotos.append("fotos", foto);
      });

      if (formDataFotos.has("fotos")) {
        try {
          await axios.post(
            `http://localhost:5000/api/imoveis/${imovelId}/upload`,
            formDataFotos,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          fotosUpdated = true;
        } catch (uploadErr) {
          console.error(
            "[v0] Erro ao fazer upload das fotos (continuando):",
            uploadErr
          );
          // Continua mesmo se falhar
        }
      }

      setUpdatedImovelId(imovelId);
      setShowSuccessPopup(true);
      if (onImovelUpdated) {
        onImovelUpdated();
      }
    } catch (err) {
      console.error("[v0] Erro ao atualizar imóvel:", err);

      if (imovelUpdated) {
        setUpdatedImovelId(imovelId);
        setShowSuccessPopup(true);
        if (onImovelUpdated) {
          onImovelUpdated();
        }
        return;
      }

      let errorMessage = "Erro ao atualizar o imóvel";

      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (!navigator.onLine) {
        errorMessage = "Sem conexão com a internet";
      }

      setErrorMsg(errorMessage);
      setActiveTab(1);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessPopup(false);
    handleClosePopup();
  };

  const handleGoToImovel = () => {
    setShowSuccessPopup(false);
    handleClosePopup();
    if (updatedImovelId) {
      navigate(`/imovel/${updatedImovelId}`);
    }
  };

  const formatFieldLabel = (field) => {
    const labels = {
      acessibilidade_pcd: "Acessibilidade PCD",
      aceita_animais: "Aceita Animais",
      academia: "Academia",
      alarme: "Alarme",
      bicicletario: "Bicicletário",
      brinquedoteca: "Brinquedoteca",
      camera_vigilancia: "Câmera de Vigilância",
      carregador_carro_eletrico: "Carregador de Carro Elétrico",
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
      lancamento: "Lançamento",
      lareira: "Lareira",
      lavanderia: "Lavanderia",
      mobiliado: "Mobiliado",
      na_planta: "Na Planta",
      playground: "Playground",
      piscina: "Piscina",
      pomar: "Pomar",
      portaria_24h: "Portaria 24h",
      quadra: "Quadra",
      sala_jogos: "Sala de Jogos",
      salao_de_festa: "Salão de Festa",
      suite: "Suíte",
      varanda: "Varanda",
    };
    return labels[field] || field.replace(/_/g, " ");
  };

  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showPopup]);

  if (isLoading) {
    return (
      <>
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Carregando imóvel...</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <button className="close-popup-btn" onClick={handleClosePopup}>
              <IoClose size={28} color="#191970" />
            </button>
            {errorMsg && <p className="error-msg">{errorMsg}</p>}
            <div className="tabs-container">
              <button
                className={`tab ${activeTab === 1 ? "active" : ""} ${
                  Object.keys(fieldErrors).some((key) =>
                    ["titulo", "descricao", "preco"].includes(key)
                  )
                    ? "has-error"
                    : ""
                }`}
                onClick={() => handleTabClick(1)}
                type="button"
              >
                Informações Básicas
              </button>
              <button
                className={`tab ${activeTab === 2 ? "active" : ""}`}
                onClick={() => handleTabClick(2)}
                type="button"
              >
                Características
              </button>
              <button
                className={`tab ${activeTab === 3 ? "active" : ""}`}
                onClick={() => handleTabClick(3)}
                type="button"
              >
                Fotos
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {activeTab === 1 && (
                <div className="tab-content">
                  <h4>Identificação</h4>
                  <div className="form-row">
                    <input
                      type="text"
                      name="titulo"
                      placeholder="Título *"
                      value={formData.titulo}
                      onChange={handleInputChange}
                      className={`full-width ${
                        fieldErrors.titulo ? "input-error" : ""
                      }`}
                    />
                  </div>
                  {fieldErrors.titulo && (
                    <p className="field-error-msg">{fieldErrors.titulo}</p>
                  )}

                  <div className="form-row">
                    <textarea
                      name="descricao"
                      placeholder="Descrição *"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      className={`full-width ${
                        fieldErrors.descricao ? "input-error" : ""
                      }`}
                      rows="4"
                    />
                  </div>
                  {fieldErrors.descricao && (
                    <p className="field-error-msg">{fieldErrors.descricao}</p>
                  )}

                  <h4>Preço</h4>
                  <div className="form-row">
                    <input
                      type="text"
                      name="preco"
                      placeholder={formData.preco ? "" : "Preço *"}
                      value={formData.preco}
                      onChange={handleInputChange}
                      className={`full-width ${
                        fieldErrors.preco ? "input-error" : ""
                      }`}
                    />
                  </div>
                  {fieldErrors.preco && (
                    <p className="field-error-msg">{fieldErrors.preco}</p>
                  )}

                  <div className="form-row">
                    <input
                      type="text"
                      name="preco_destaque"
                      placeholder={
                        formData.preco_destaque
                          ? ""
                          : "Preço Destaque (opcional)"
                      }
                      value={formData.preco_destaque}
                      onChange={handleInputChange}
                      className="full-width"
                    />
                  </div>

                  <h4>Classificação</h4>
                  <div className="form-row">
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecione o Tipo</option>
                      <option value="Apartamento">Apartamento</option>
                      <option value="Casa">Casa</option>
                      <option value="Chalé">Chalé</option>
                      <option value="Cobertura">Cobertura</option>
                      <option value="Fazenda">Fazenda</option>
                      <option value="Galpão">Galpão</option>
                      <option value="Kitnet">Kitnet</option>
                      <option value="Sala comercial">Sala Comercial</option>
                      <option value="Sítio">Sítio</option>
                      <option value="Terreno">Terreno</option>
                    </select>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecione o Status</option>
                      <option value="disponivel">Disponível</option>
                      <option value="vendido">Vendido</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <select
                      name="finalidade"
                      value={formData.finalidade}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecione a Finalidade</option>
                      {finalidades.map((f) => (
                        <option key={f} value={f.toLowerCase()}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <h4>Destaque</h4>
                  <div className="form-row">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="destaque"
                        checked={formData.destaque}
                        onChange={handleInputChange}
                      />
                      <span>Marcar como Destaque</span>
                    </label>
                  </div>

                  <h4>Visibilidade</h4>
                  <div className="form-row">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="visivel"
                        checked={!formData.visivel}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            visivel: !e.target.checked,
                          }));
                        }}
                      />
                      <span>Ocultar (não exibir para usuários)</span>
                    </label>
                  </div>

                  <h4>Localização</h4>
                  <div className="form-row">
                    <input
                      type="text"
                      name="cep"
                      placeholder="CEP"
                      value={formData.cep}
                      onChange={handleInputChange}
                    />
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecione o Estado</option>
                      {estados.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <select
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecione a Cidade</option>
                      {cidades.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      name="bairro"
                      placeholder="Bairro"
                      value={formData.bairro}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-row">
                    <input
                      type="text"
                      name="coordenadas"
                      placeholder="Coordenadas"
                      value={formData.coordenadas}
                      onChange={handleInputChange}
                      className="full-width"
                    />
                  </div>
                  <h4>Áreas</h4>
                  <div className="form-row">
                    <input
                      type="text"
                      name="area_total"
                      placeholder="Área Total (m²)"
                      value={formData.area_total}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      name="area_construida"
                      placeholder="Área Construída (m²)"
                      value={formData.area_construida}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
              {activeTab === 2 && (
                <div className="tab-content">
                  <h4>Valores</h4>
                  <div className="form-row">
                    <input
                      type="text"
                      name="condominio"
                      placeholder={formData.condominio ? "" : "Condomíno"}
                      value={formData.condominio}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      name="iptu"
                      placeholder={formData.iptu ? "" : "IPTU"}
                      value={formData.iptu}
                      onChange={handleInputChange}
                    />
                  </div>
                  <h4>Cômodos</h4>
                  <div className="form-row">
                    <input
                      type="text"
                      name="quarto"
                      placeholder="Quartos"
                      value={formData.quarto}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      name="banheiro"
                      placeholder="Banheiros"
                      value={formData.banheiro}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="text"
                      name="vaga"
                      placeholder="Vagas de Garagem"
                      value={formData.vaga}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      name="ar_condicionado"
                      placeholder="Ar Condicionado"
                      value={formData.ar_condicionado}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="text"
                      name="andar"
                      placeholder="Andar"
                      value={formData.andar}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      name="andar_total"
                      placeholder="Total de Andares"
                      value={formData.andar_total}
                      onChange={handleInputChange}
                    />
                  </div>
                  <h4>Construtora</h4>
                  <div className="form-row">
                    <select
                      name="construtora"
                      value={formData.construtora}
                      onChange={handleInputChange}
                      className="full-width"
                    >
                      <option value="">Selecione a Construtora</option>
                      {construtoras.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="month"
                      name="data_entrega"
                      placeholder="Previsão de Entrega"
                      value={formData.data_entrega}
                      onChange={handleInputChange}
                    />
                  </div>
                  <h4>Características</h4>
                  <div className="caracteristicas-grid">
                    {booleanFields.map((f) => (
                      <label key={f} className="checkbox-label">
                        <input
                          type="checkbox"
                          name={f}
                          checked={formData[f]}
                          onChange={handleInputChange}
                        />
                        <span>{formatFieldLabel(f)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 3 && (
                <div className="tab-content">
                  <h4>Fotos do Imóvel</h4>
                  <div className="fotos-grid">
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const isExisting = idx < existingFotos.length;
                      const foto = isExisting
                        ? existingFotos[idx]
                        : formData.fotos[idx - existingFotos.length];

                      return (
                        <div
                          key={idx}
                          className={`foto-item ${foto ? "has-photo" : ""} ${
                            dragOverIndex === idx ? "drag-over" : ""
                          }`}
                          draggable={!!foto}
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnter={(e) => handleFileDragEnter(e, idx)}
                          onDragLeave={(e) => handleFileDragLeave(e, idx)}
                        >
                          {foto ? (
                            <>
                              <img
                                src={
                                  isExisting
                                    ? `http://localhost:5000${foto.caminho_foto}`
                                    : URL.createObjectURL(foto) ||
                                      "/placeholder.svg"
                                }
                                alt={`foto-${idx}`}
                              />
                              <button
                                type="button"
                                className="remove-foto-btn"
                                onClick={() => {
                                  if (isExisting) {
                                    handleRemoveExistingFoto(foto.id);
                                  } else {
                                    handleRemoveFoto(
                                      idx - existingFotos.length
                                    );
                                  }
                                }}
                              >
                                <IoClose size={20} color="#191970" />
                              </button>
                            </>
                          ) : (
                            <label className="foto-upload-label">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (!isExisting) {
                                    handleFotoChange(
                                      idx - existingFotos.length,
                                      e.target.files[0]
                                    );
                                  }
                                }}
                                style={{ display: "none" }}
                              />
                              <span>+</span>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="submit-container">
                <button type="submit" className="submit-btn">
                  Atualizar Imóvel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showConfirmPopup && (
        <div
          className="popup-overlay"
          onClick={() => setShowConfirmPopup(false)}
        >
          <div
            className="confirmation-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Confirmar Atualização</h3>
            <p>Tem certeza que deseja atualizar este imóvel?</p>
            <div className="confirmation-buttons">
              <button className="confirm-btn" onClick={handleConfirmSubmit}>
                Confirmar
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowConfirmPopup(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessPopup && (
        <div className="popup-overlay" onClick={handleCloseSuccess}>
          <div className="success-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup-btn" onClick={handleCloseSuccess}>
              ×
            </button>
            <h3>Imóvel Atualizado com Sucesso!</h3>
            <div className="success-buttons">
              <button className="go-to-imovel-btn" onClick={handleGoToImovel}>
                Ver Imóvel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditarImovel;
