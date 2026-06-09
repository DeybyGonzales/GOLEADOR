CREATE TABLE usuarios (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    avatar_url  VARCHAR(255),
    creado_en   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE partidos (
    id              SERIAL PRIMARY KEY,
    equipo_local    VARCHAR(10) NOT NULL,
    equipo_visitante VARCHAR(10) NOT NULL,
    flag_local      VARCHAR(10),
    flag_visitante  VARCHAR(10),
    fecha           TIMESTAMP NOT NULL,
    estadio         VARCHAR(150),
    goles_local     INT,
    goles_visitante INT,
    finalizado      BOOLEAN DEFAULT FALSE,
    creado_en       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE salas (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    codigo      VARCHAR(10) UNIQUE NOT NULL,
    admin_id    INT REFERENCES usuarios(id) ON DELETE CASCADE,
    creado_en   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sala_miembros (
    sala_id     INT REFERENCES salas(id) ON DELETE CASCADE,
    usuario_id  INT REFERENCES usuarios(id) ON DELETE CASCADE,
    unido_en    TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (sala_id, usuario_id)
);

CREATE TABLE pronosticos (
    id              SERIAL PRIMARY KEY,
    usuario_id      INT REFERENCES usuarios(id) ON DELETE CASCADE,
    partido_id      INT REFERENCES partidos(id) ON DELETE CASCADE,
    goles_local     INT NOT NULL,
    goles_visitante INT NOT NULL,
    registrado_en   TIMESTAMP DEFAULT NOW(),
    pts_exacto      INT DEFAULT 0,
    pts_ganador     INT DEFAULT 0,
    pts_diferencia  INT DEFAULT 0,
    pts_temprano    INT DEFAULT 0,
    pts_total       INT DEFAULT 0,
    calculado       BOOLEAN DEFAULT FALSE,
    UNIQUE (usuario_id, partido_id)
);

CREATE TABLE puntaje_global (
    usuario_id      INT PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    puntos_total    INT DEFAULT 0,
    exactos         INT DEFAULT 0,
    ganadores       INT DEFAULT 0,
    racha_actual    INT DEFAULT 0,
    racha_maxima    INT DEFAULT 0,
    actualizado_en  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE puntaje_sala (
    sala_id         INT REFERENCES salas(id) ON DELETE CASCADE,
    usuario_id      INT REFERENCES usuarios(id) ON DELETE CASCADE,
    puntos_total    INT DEFAULT 0,
    PRIMARY KEY (sala_id, usuario_id)
);

INSERT INTO partidos (equipo_local, equipo_visitante, flag_local, flag_visitante, fecha, estadio) VALUES
('BRA', 'ARG', '🇧🇷', '🇦🇷', '2026-06-14 20:00:00', 'MetLife Stadium'),
('USA', 'ENG', '🇺🇸', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '2026-06-15 21:00:00', 'SoFi Stadium'),
('MEX', 'FRA', '🇲🇽', '🇫🇷', '2026-06-16 18:00:00', 'Estadio Azteca'),
('ESP', 'GER', '🇪🇸', '🇩🇪', '2026-06-17 20:00:00', 'AT&T Stadium'),
('POR', 'ITA', '🇵🇹', '🇮🇹', '2026-06-18 21:00:00', 'Levi Stadium');

INSERT INTO usuarios (nombre, email, password) VALUES
('Deyby Gonzales', 'deyby@goleador.com', '$2b$10$demo_hash_replace_in_prod');

INSERT INTO salas (nombre, codigo, admin_id) VALUES
('Tecsup Champions', 'WC2026X', 1);

INSERT INTO sala_miembros (sala_id, usuario_id) VALUES (1, 1);
INSERT INTO puntaje_global (usuario_id) VALUES (1);
INSERT INTO puntaje_sala (sala_id, usuario_id) VALUES (1, 1);
