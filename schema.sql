-- =============================================
-- PostgreSQL Database Schema (Structure Only)
-- Generated from pg_dump - Clean version
-- =============================================

-- =============================================
-- SEQUENCES
-- =============================================

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.imoveis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.curtidas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.fotos_imoveis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.imoveis_caracteristicas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.usuario_sessoes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.email_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.email_comercial_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.email_verificacao_pendente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.tentativas_verificacao_email_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- =============================================
-- TABLES
-- =============================================

CREATE TABLE public.usuarios (
    id integer NOT NULL DEFAULT nextval('public.usuarios_id_seq'::regclass),
    nome character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    senha character varying(255) NOT NULL,
    tipo_usuario character varying(10) NOT NULL,
    data_criacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usuarios_tipo_usuario_check CHECK (((tipo_usuario)::text = ANY ((ARRAY['user'::character varying, 'adm'::character varying])::text[])))
);

CREATE TABLE public.imoveis (
    id integer NOT NULL DEFAULT nextval('public.imoveis_id_seq'::regclass),
    titulo character varying(200) NOT NULL,
    descricao text,
    preco numeric(12,2) NOT NULL,
    visivel boolean DEFAULT true,
    data_criacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao timestamp without time zone,
    criado_por integer NOT NULL,
    atualizado_por integer,
    destaque boolean DEFAULT false,
    status character varying(20),
    finalidade character varying(20),
    cep character varying(20),
    area_total numeric(10,2),
    area_construida numeric(10,2),
    estado character varying(100),
    cidade character varying(100),
    bairro character varying(150),
    tipo character varying(50),
    coordenadas character varying(50),
    preco_destaque numeric(15,2)
);

CREATE TABLE public.curtidas (
    id integer NOT NULL DEFAULT nextval('public.curtidas_id_seq'::regclass),
    usuario_id integer NOT NULL,
    imovel_id integer NOT NULL,
    data_curtida timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.fotos_imoveis (
    id integer NOT NULL DEFAULT nextval('public.fotos_imoveis_id_seq'::regclass),
    imovel_id integer NOT NULL,
    caminho_foto character varying(255) NOT NULL
);

CREATE TABLE public.imoveis_caracteristicas (
    id integer NOT NULL DEFAULT nextval('public.imoveis_caracteristicas_id_seq'::regclass),
    imovel_id integer,
    condominio numeric(10,2),
    iptu numeric(10,2),
    quarto integer,
    suite boolean DEFAULT false,
    banheiro integer,
    vaga integer,
    andar integer,
    andar_total integer,
    piscina boolean DEFAULT false,
    churrasqueira boolean DEFAULT false,
    salao_de_festa boolean DEFAULT false,
    academia boolean DEFAULT false,
    playground boolean DEFAULT false,
    jardim boolean DEFAULT false,
    varanda boolean DEFAULT false,
    interfone boolean DEFAULT false,
    acessibilidade_pcd boolean DEFAULT false,
    mobiliado boolean DEFAULT false,
    ar_condicionado integer,
    energia_solar boolean DEFAULT false,
    quadra boolean DEFAULT false,
    lavanderia boolean DEFAULT false,
    closet boolean DEFAULT false,
    escritorio boolean DEFAULT false,
    lareira boolean DEFAULT false,
    alarme boolean DEFAULT false,
    camera_vigilancia boolean DEFAULT false,
    bicicletario boolean DEFAULT false,
    sala_jogos boolean DEFAULT false,
    brinquedoteca boolean DEFAULT false,
    elevador boolean DEFAULT false,
    pomar boolean DEFAULT false,
    lago boolean DEFAULT false,
    aceita_animais boolean DEFAULT false,
    construtora character varying(150),
    portaria_24h boolean DEFAULT false,
    carregador_carro_eletrico boolean DEFAULT false,
    gerador_energia boolean DEFAULT false,
    estudio boolean DEFAULT false,
    na_planta boolean DEFAULT false,
    lancamento boolean DEFAULT false,
    data_entrega date
);

CREATE TABLE public.usuario_sessoes (
    id integer NOT NULL DEFAULT nextval('public.usuario_sessoes_id_seq'::regclass),
    usuario_id integer NOT NULL,
    data_login timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    data_logout timestamp without time zone,
    ativo boolean DEFAULT true
);

CREATE TABLE public.email_conta (
    id integer NOT NULL DEFAULT nextval('public.email_tokens_id_seq'::regclass),
    usuario_id integer NOT NULL,
    tipo character varying(50) NOT NULL,
    token text NOT NULL,
    expiracao timestamp with time zone NOT NULL,
    usado boolean DEFAULT false,
    criado_em timestamp with time zone DEFAULT now(),
    tentativas_restantes integer DEFAULT 5,
    bloqueado_ate timestamp with time zone,
    ultima_tentativa timestamp with time zone
);

CREATE TABLE public.email_comercial (
    id integer NOT NULL DEFAULT nextval('public.email_comercial_id_seq'::regclass),
    usuario_id integer NOT NULL,
    imovel_id integer NOT NULL,
    enviado_em timestamp with time zone DEFAULT now()
);

CREATE TABLE public.email_verificacao_pendente (
    id integer NOT NULL DEFAULT nextval('public.email_verificacao_pendente_id_seq'::regclass),
    nome character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    senha character varying(255) NOT NULL,
    tipo_usuario character varying(50) NOT NULL,
    codigo character varying(10) NOT NULL,
    expiracao timestamp without time zone NOT NULL,
    aceitou_termos boolean DEFAULT false NOT NULL,
    aceitou_privacidade boolean DEFAULT false NOT NULL,
    verificado boolean DEFAULT false,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.tentativas_verificacao_email (
    id integer NOT NULL DEFAULT nextval('public.tentativas_verificacao_email_id_seq'::regclass),
    email character varying(255) NOT NULL,
    tentativas_restantes integer DEFAULT 5,
    bloqueado_ate timestamp with time zone,
    tipo character varying(50) NOT NULL,
    ultima_tentativa timestamp with time zone DEFAULT now(),
    criado_em timestamp with time zone DEFAULT now()
);

-- =============================================
-- SEQUENCE OWNERSHIP
-- =============================================

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;
ALTER SEQUENCE public.imoveis_id_seq OWNED BY public.imoveis.id;
ALTER SEQUENCE public.curtidas_id_seq OWNED BY public.curtidas.id;
ALTER SEQUENCE public.fotos_imoveis_id_seq OWNED BY public.fotos_imoveis.id;
ALTER SEQUENCE public.imoveis_caracteristicas_id_seq OWNED BY public.imoveis_caracteristicas.id;
ALTER SEQUENCE public.usuario_sessoes_id_seq OWNED BY public.usuario_sessoes.id;
ALTER SEQUENCE public.email_tokens_id_seq OWNED BY public.email_conta.id;
ALTER SEQUENCE public.email_comercial_id_seq OWNED BY public.email_comercial.id;
ALTER SEQUENCE public.email_verificacao_pendente_id_seq OWNED BY public.email_verificacao_pendente.id;
ALTER SEQUENCE public.tentativas_verificacao_email_id_seq OWNED BY public.tentativas_verificacao_email.id;

-- =============================================
-- PRIMARY KEYS
-- =============================================

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.imoveis
    ADD CONSTRAINT imoveis_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.curtidas
    ADD CONSTRAINT curtidas_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.fotos_imoveis
    ADD CONSTRAINT fotos_imoveis_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.imoveis_caracteristicas
    ADD CONSTRAINT imoveis_caracteristicas_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.usuario_sessoes
    ADD CONSTRAINT usuario_sessoes_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.email_conta
    ADD CONSTRAINT email_tokens_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.email_comercial
    ADD CONSTRAINT email_comercial_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.email_verificacao_pendente
    ADD CONSTRAINT email_verificacao_pendente_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.tentativas_verificacao_email
    ADD CONSTRAINT tentativas_verificacao_email_pkey PRIMARY KEY (id);

-- =============================================
-- UNIQUE CONSTRAINTS
-- =============================================

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);

ALTER TABLE ONLY public.curtidas
    ADD CONSTRAINT curtidas_usuario_id_imovel_id_key UNIQUE (usuario_id, imovel_id);

ALTER TABLE ONLY public.email_verificacao_pendente
    ADD CONSTRAINT email_verificacao_pendente_email_key UNIQUE (email);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_email_conta_bloqueado_ate ON public.email_conta USING btree (usuario_id, tipo, bloqueado_ate);

CREATE INDEX idx_email_conta_tentativas ON public.email_conta USING btree (usuario_id, tipo, tentativas_restantes);

CREATE INDEX idx_email_verificacao_pendente_email ON public.email_verificacao_pendente USING btree (email);

CREATE INDEX idx_email_verificacao_pendente_verificado ON public.email_verificacao_pendente USING btree (verificado);

CREATE INDEX idx_tentativas_email_tipo ON public.tentativas_verificacao_email USING btree (email, tipo);

-- =============================================
-- FOREIGN KEYS
-- =============================================

ALTER TABLE ONLY public.imoveis
    ADD CONSTRAINT imoveis_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES public.usuarios(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.imoveis
    ADD CONSTRAINT imoveis_atualizado_por_fkey FOREIGN KEY (atualizado_por) REFERENCES public.usuarios(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.curtidas
    ADD CONSTRAINT curtidas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.curtidas
    ADD CONSTRAINT curtidas_imovel_id_fkey FOREIGN KEY (imovel_id) REFERENCES public.imoveis(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.fotos_imoveis
    ADD CONSTRAINT fotos_imoveis_imovel_id_fkey FOREIGN KEY (imovel_id) REFERENCES public.imoveis(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.imoveis_caracteristicas
    ADD CONSTRAINT imoveis_caracteristicas_imovel_id_fkey FOREIGN KEY (imovel_id) REFERENCES public.imoveis(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.usuario_sessoes
    ADD CONSTRAINT usuario_sessoes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.email_conta
    ADD CONSTRAINT email_tokens_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.email_comercial
    ADD CONSTRAINT email_comercial_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.email_comercial
    ADD CONSTRAINT email_comercial_imovel_id_fkey FOREIGN KEY (imovel_id) REFERENCES public.imoveis(id) ON DELETE CASCADE;

--------------Alterações-------------
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS aceita_emails_comerciais BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_usuarios_aceita_emails_comerciais
  ON public.usuarios (aceita_emails_comerciais);

ALTER TABLE public.email_verificacao_pendente
  ADD COLUMN IF NOT EXISTS aceita_emails_comerciais BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.email_verificacao_pendente
  ADD COLUMN IF NOT EXISTS aceita_emails_comerciais BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS aceita_emails_comerciais BOOLEAN NOT NULL DEFAULT FALSE;

  ALTER TABLE public.email_verificacao_pendente
  ADD COLUMN IF NOT EXISTS aceita_emails_comerciais BOOLEAN NOT NULL DEFAULT FALSE;