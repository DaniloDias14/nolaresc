"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ImovelModal from "../../ImovelModal/ImovelModal";

// Component to handle direct access to /imovel/:id
const ImovelPage = ({ usuario }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imovel, setImovel] = useState(null);
  const [curtidas, setCurtidas] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Fetch property by ID
  useEffect(() => {
    if (!id) return;

    const headers = {};
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    fetch(`http://localhost:5000/api/imoveis/${id}`, { headers })
      .then((res) => {
        if (res.status === 403) {
          // Property is hidden and user is not admin
          throw new Error("Acesso negado");
        }
        if (!res.ok) throw new Error("Imóvel não encontrado");
        return res.json();
      })
      .then((data) => {
        setImovel(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar imóvel:", err);
        setLoading(false);
        navigate("/comprar", { replace: true });
      });
  }, [id, navigate]);

  // Fetch user likes if logged in
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

  const handleClose = () => {
    // Check if there's a referrer from the same origin (internal navigation)
    const referrer = document.referrer;
    const currentOrigin = window.location.origin;

    // If referrer exists and is from the same origin, go back in history
    if (referrer && referrer.startsWith(currentOrigin)) {
      navigate(-1);
    } else {
      // If no internal referrer (direct access), redirect to default page
      navigate("/comprar", { replace: true });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Carregando imóvel...</p>
      </div>
    );
  }

  if (!imovel) {
    return null;
  }

  return (
    <ImovelModal
      imovel={imovel}
      onClose={handleClose}
      usuario={usuario}
      curtidas={curtidas}
      setCurtidas={setCurtidas}
    />
  );
};

export default ImovelPage;
