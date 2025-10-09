-- =====================================================================
-- HOJA DE VISITA v2.1 - Route Visit Report Query
-- =====================================================================
-- Purpose: Generate daily visit sheets for sales routes including:
--   - Client information and visit schedule
--   - Sales history (current/previous year, weekly trends)
--   - Cooler inventory (enfriadores)
--   - Product targets by GECS tier
--   - Special programs (HEISHOP, promotional canvas)
--   - Brand-specific sales (Miller, Indio, Tecate, XX Lager)
--
-- Input Parameters:
--   @RUTA: Route code (e.g., '001')
--   @FECHA: Report date (e.g., '2025-10-08')
-- =====================================================================

DECLARE @FECHA AS DATE,
        @S1 AS INT,    -- Current week
        @S2 AS INT,    -- 1 week ago
        @S3 AS INT,    -- 2 weeks ago
        @S4 AS INT,    -- 3 weeks ago
        @RUTA AS INT;

-- =====================================================================
-- INPUT PARAMETERS - Set these values to generate the report
-- =====================================================================
SET @RUTA = '001';
SET @FECHA = '2025-10-08';

-- =====================================================================
-- CALCULATE WEEK REFERENCES based on report date
-- =====================================================================
SET @S1 = (SELECT DISTINCT SEMANA FROM MBAFERGUEZ..R_Semanas WHERE FECHA = @FECHA);        -- Current week
SET @S2 = (SELECT DISTINCT SEMANA - 1 FROM MBAFERGUEZ..R_Semanas WHERE FECHA = @FECHA);    -- Previous week
SET @S3 = (SELECT DISTINCT SEMANA - 2 FROM MBAFERGUEZ..R_Semanas WHERE FECHA = @FECHA);    -- 2 weeks ago
SET @S4 = (SELECT DISTINCT SEMANA - 3 FROM MBAFERGUEZ..R_Semanas WHERE FECHA = @FECHA);    -- 3 weeks ago

-- =====================================================================
-- MAIN QUERY - Build complete visit sheet
-- =====================================================================
SELECT
    -- Client identification
    CTES.CLIENTE_ID,
    CTES.NOMBRE_CLIENTE,
    CTES.GECS,
    CTES.RUTA,
    CTES.RUTA_REP,
    CTES.VISITA,

    -- Cooler inventory
    ENFRIADORES,

    -- GECS objectives and compliance
    OBJETIVOXSEMANA,

    -- Sales comparison: current month vs previous year
    CERVEZA_MANT,    -- Beer sales - Previous year same month
    CERVEZA_MACT,    -- Beer sales - Current year current month

    -- Weekly beer sales trend (last 4 weeks)
    CERVEZA_SANT3,   -- Beer sales - 3 weeks ago
    CERVEZA_SANT2,   -- Beer sales - 2 weeks ago
    CERVEZA_SANT,    -- Beer sales - 1 week ago
    CERVEZA_SACT,    -- Beer sales - Current week

    -- GECS compliance indicator
    CTECUMPLIDO,     -- 1 if client met weekly target, 0 otherwise

    -- Non-beer products (BRUME)
    BRUME_SACT,      -- BRUME sales - Current week

    -- Special programs
    DESCLP,          -- Promotional canvas program
    IDSHOP,          -- HEISHOP enabled indicator
    VISITA,          -- Visit frequency schedule

    -- Brand-specific sales (current month)
    MILLER,          -- Miller High sales
    INDIO,           -- Indio sales (non-returnable only)
    TECATE,          -- Tecate sales
    INDIOM,          -- Indio sales (all formats)
    XX               -- XX Lager sales

FROM (
    -- =====================================================================
    -- BASE CLIENT LIST with visit frequency
    -- =====================================================================
    -- Build visit schedule string from day flags (L=Lunes, M=Martes, etc.)
    -- Filter by route and day of week based on @FECHA
    -- =====================================================================
    SELECT
        C.CLIENTE_ID,
        NOMBRE_CLIENTE,
        RUTA,
        RUTA_REP,
        -- Build visit frequency string (e.g., 'LMRJV' = Mon-Fri)
        CONVERT(VARCHAR, CASE WHEN LUNES = 1 THEN 'L' ELSE '' END) +
        CONVERT(VARCHAR, CASE WHEN MARTES = 1 THEN 'M' ELSE '' END) +
        CONVERT(VARCHAR, CASE WHEN MIERCOLES = 1 THEN 'R' ELSE '' END) +
        CONVERT(VARCHAR, CASE WHEN JUEVES = 1 THEN 'J' ELSE '' END) +
        CONVERT(VARCHAR, CASE WHEN VIERNES = 1 THEN 'V' ELSE '' END) +
        CONVERT(VARCHAR, CASE WHEN SABADO = 1 THEN 'S' ELSE '' END) AS VISITA,
        GECS
    FROM mbaFerguez..R_CLIENTES C

    -- Join visit schedule
    LEFT JOIN mbaFerguez..R_VISITAS V
        ON C.CLIENTE_ID = V.CLIENTE_ID

    -- Filter by day of week based on report date
    -- TODO: Replace hardcoded 'MARTES=1' with dynamic day selection based on @FECHA
    WHERE MARTES = 1
) CTES

-- =====================================================================
-- BEER SALES: Previous Year Same Month
-- =====================================================================
-- Compare against same month last year to measure YoY growth
-- =====================================================================
LEFT JOIN (
    SELECT
        CLIENTE_ID,
        SUM(CARTONES) AS CERVEZA_MANT
    FROM mbaFerguez..vwVentasFerguez
    WHERE GRUPO = 'CERVEZA'
        AND MESVTA = MONTH(@FECHA)
        AND ANIOVTA = YEAR(@FECHA) - 1
    GROUP BY CLIENTE_ID
) VANTC
    ON CTES.CLIENTE_ID = VANTC.CLIENTE_ID

-- =====================================================================
-- BEER SALES: Current Year Current Month
-- =====================================================================
LEFT JOIN (
    SELECT
        CLIENTE_ID,
        SUM(CARTONES) AS CERVEZA_MACT
    FROM mbaFerguez..vwVentasFerguez
    WHERE GRUPO = 'CERVEZA'
        AND MESVTA = MONTH(@FECHA)
        AND ANIOVTA = YEAR(@FECHA)
    GROUP BY CLIENTE_ID
) VACTC
    ON CTES.CLIENTE_ID = VACTC.CLIENTE_ID

-- =====================================================================
-- WEEKLY BEER SALES TREND (Last 4 Weeks)
-- =====================================================================
-- Track weekly performance to identify trends and seasonality
-- =====================================================================

-- Week -3 (3 weeks ago)
LEFT JOIN (
    SELECT
        CLIENTE_ID,
        SUM(CARTONES) AS CERVEZA_SANT3
    FROM mbaFerguez..vwVentasFerguez
    WHERE GRUPO = 'CERVEZA'
        AND SEMANA = (SELECT DISTINCT SEMANA FROM MBAFERGUEZ..R_SEMANAS WHERE FECHA = @FECHA) - 3
        AND ANIOVTA = YEAR(@FECHA)
    GROUP BY CLIENTE_ID
) VANTS3
    ON CTES.CLIENTE_ID = VANTS3.CLIENTE_ID

-- Week -2 (2 weeks ago)
LEFT JOIN (
    SELECT
        CLIENTE_ID,
        SUM(CARTONES) AS CERVEZA_SANT2
    FROM mbaFerguez..vwVentasFerguez
    WHERE GRUPO = 'CERVEZA'
        AND SEMANA = (SELECT DISTINCT SEMANA FROM MBAFERGUEZ..R_SEMANAS WHERE FECHA = @FECHA) - 2
        AND ANIOVTA = YEAR(@FECHA)
    GROUP BY CLIENTE_ID
) VANTS2
    ON CTES.CLIENTE_ID = VANTS2.CLIENTE_ID

-- Week -1 (previous week)
LEFT JOIN (
    SELECT
        CLIENTE_ID,
        SUM(CARTONES) AS CERVEZA_SANT
    FROM mbaFerguez..vwVentasFerguez
    WHERE GRUPO = 'CERVEZA'
        AND SEMANA = (SELECT DISTINCT SEMANA FROM MBAFERGUEZ..R_SEMANAS WHERE FECHA = @FECHA) - 1
        AND ANIOVTA = YEAR(@FECHA)
    GROUP BY CLIENTE_ID
) VANTS
    ON CTES.CLIENTE_ID = VANTS.CLIENTE_ID

-- Current week
LEFT JOIN (
    SELECT
        CLIENTE_ID,
        SUM(CARTONES) AS CERVEZA_SACT
    FROM mbaFerguez..vwVentasFerguez
    WHERE GRUPO = 'CERVEZA'
        AND SEMANA = (SELECT DISTINCT SEMANA FROM MBAFERGUEZ..R_SEMANAS WHERE FECHA = @FECHA)
        AND ANIOVTA = YEAR(@FECHA)
    GROUP BY CLIENTE_ID
) VACTS
    ON CTES.CLIENTE_ID = VACTS.CLIENTE_ID

-- =====================================================================
-- NON-BEER SALES (BRUME Products) - Current Week
-- =====================================================================
-- Excludes ice, promotional items, and packaging materials
-- =====================================================================
LEFT JOIN (
    SELECT
        CLIENTE_ID,
        SUM(CARTONES) AS BRUME_SACT
    FROM mbaFerguez..vwVentasFerguez
    WHERE GRUPO NOT IN ('CERVEZA', 'HIELO', 'PROMOCIONAL', 'PROMOCIONALES', 'VASO ENCERADO', 'ENVASE', 'PAQUETE')
        AND SEMANA = (SELECT DISTINCT SEMANA FROM MBAFERGUEZ..R_SEMANAS WHERE FECHA = @FECHA)
        AND ANIOVTA = YEAR(@FECHA)
    GROUP BY CLIENTE_ID
) BACTS
    ON CTES.CLIENTE_ID = BACTS.CLIENTE_ID

-- =====================================================================
-- COOLER INVENTORY (Enfriadores)
-- =====================================================================
-- Track number of coolers at each client location
-- =====================================================================
LEFT JOIN (
    SELECT * FROM MBAFERGUEZ..bdenf
) ENFR
    ON CTES.CLIENTE_ID = ENFR.idCliente

-- =====================================================================
-- PROMOTIONAL CANVAS PROGRAM (PROMO LONA)
-- =====================================================================
-- Clients enrolled in promotional canvas program 'LPG008'
-- =====================================================================
LEFT JOIN (
    SELECT
        *,
        SUBSTRING(CLIENTECLAVE, 3, 6) AS ID,
        'PROMLONA' AS DESCLP
    FROM dbGpoFernandez..ClienteEsquema
    WHERE esquemaid = 'LPG008'
) LP
    ON CTES.CLIENTE_ID = LP.ID COLLATE Modern_Spanish_CI_AS

-- =====================================================================
-- HEISHOP ENABLED CLIENTS
-- =====================================================================
-- Track clients enabled for HEISHOP platform:
--   1. Base HEISHOP registry
--   2. Clients with HIP prefix purchases (since 2025-04-21)
--   3. Clients with HI prefix presales (since 2025-04-21)
-- =====================================================================
LEFT JOIN (
    SELECT DISTINCT CLIENTE_ID AS IDSHOP
    FROM (
        -- Base HEISHOP registry
        SELECT * FROM mbaFerguez..R_HEISHOP

        UNION ALL

        -- New clients identified through HIP purchases
        SELECT DISTINCT CLIENTE_ID
        FROM MBAFERGUEZ..VWVENTASDETALLECAP
        WHERE OBSERVACIONES LIKE '%HIP%'
            AND FECHAVTA >= '2025-04-21'
            AND CLIENTE_ID NOT IN (SELECT * FROM mbaFerguez..R_HEISHOP)

        UNION ALL

        -- New clients identified through HI presales
        SELECT clave
        FROM MBAFERGUEZ..vwPreventaDetallea
        WHERE FOLIO LIKE '%HI%'
            AND f_preventa >= '2025-04-21'
    ) bd
) HEI
    ON CTES.CLIENTE_ID = HEI.IDSHOP

-- =====================================================================
-- GECS OBJECTIVES AND COMPLIANCE
-- =====================================================================
-- Calculate weekly targets and compliance status based on GECS tier
-- GECS Tiers:
--   - BRONCE: 3 cartons/week, 2 cartons for payment compliance
--   - PLATA: 5 cartons/week, 3 cartons for payment compliance
--   - ORO: 14 cartons/week, 8 cartons for payment compliance
--   - PLATINO: 37 cartons/week, 19 cartons for payment compliance
--   - TITANIO: 75 cartons/week, 38 cartons for payment compliance
-- =====================================================================
LEFT JOIN (
    SELECT
        CLAVE = GECS + CONVERT(VARCHAR, SEMANA),
        BD.CLIENTE_ID,
        BD.NOMBRE_CLIENTE,
        BD.RUTA,
        BD.GECS,
        VTA,
        -- Weekly sales objective by GECS tier
        CASE
            WHEN BD.GECS = 'BRONCE' THEN 3
            WHEN BD.GECS = 'PLATA' THEN 5
            WHEN BD.GECS = 'ORO' THEN 14
            WHEN BD.GECS = 'PLATINO' THEN 37
            WHEN BD.GECS = 'TITANIO' THEN 75
        END AS OBJETIVOXSEMANA,
        -- Payment compliance threshold
        CASE
            WHEN BD.GECS = 'BRONCE' THEN 2
            WHEN BD.GECS = 'PLATA' THEN 3
            WHEN BD.GECS = 'ORO' THEN 8
            WHEN BD.GECS = 'PLATINO' THEN 19
            WHEN BD.GECS = 'TITANIO' THEN 38
        END AS CUMPLPAGO,
        SEMANA,
        -- Compliance flag: 1 if target met, 0 otherwise
        CASE
            WHEN VTA >= (
                CASE
                    WHEN BD.GECS = 'BRONCE' THEN 3
                    WHEN BD.GECS = 'PLATA' THEN 5
                    WHEN BD.GECS = 'ORO' THEN 14
                    WHEN BD.GECS = 'PLATINO' THEN 37
                    WHEN BD.GECS = 'TITANIO' THEN 75
                END
            ) THEN 1
            ELSE 0
        END AS CTECUMPLIDO
    FROM (
        SELECT
            c.CLIENTE_ID,
            NOMBRE_CLIENTE,
            RUTA,
            CASE WHEN GECS IS NULL THEN 'BRONCE' ELSE GECS END AS GECS,
            CASE WHEN VTA < 8 OR VTA IS NULL THEN 'COBRE' ELSE GECS END AS EVAGECS,
            VTA,
            SEMANA
        FROM MBAFERGUEZ..R_cLIENTES C
        LEFT JOIN (
            SELECT
                CLIENTE_ID,
                SUM(CARTONES) AS vTA,
                -- Map week variables to sequence numbers for sorting
                CASE
                    WHEN SEMANA = @S4 THEN 1
                    WHEN SEMANA = @S3 THEN 2
                    WHEN SEMANA = @S2 THEN 3
                    WHEN SEMANA = @S1 THEN 4
                END AS SEMANA
            FROM MBAFERGUEZ..vwVentasFerguez
            WHERE ANIOVTA = YEAR(@FECHA)
                AND GRUPO = 'CERVEZA'
                AND SEMANA IN (@S1)  -- Current week only for compliance calculation
            GROUP BY CLIENTE_ID, SEMANA
        ) GN
            ON C.CLIENTE_ID = GN.CLIENTE_ID
    ) BD
) CUM
    ON CTES.CLIENTE_ID = CUM.CLIENTE_ID

-- =====================================================================
-- BRAND-SPECIFIC SALES (Current Month)
-- =====================================================================
-- Track sales by key brands to identify brand penetration and opportunities
-- =====================================================================

-- Miller High sales
LEFT JOIN (
    SELECT
        CLIENTE_ID,
        SUM(CARTONES) AS MILLER
    FROM MBAFERGUEZ..vwVentasFerguez V
    WHERE GRUPO = 'CERVEZA'
        AND MESVTA = MONTH(@FECHA)
        AND ANIOVTA = YEAR(@FECHA)
        AND MARCA = 'MILLER HIGH'
    GROUP BY CLIENTE_ID, GECS
) ML
    ON CTES.CLIENTE_ID = ML.CLIENTE_ID

-- Indio sales (non-returnable only)
LEFT JOIN (
    SELECT
        CLIENTE_ID,
        SUM(cartones) AS INDIO
    FROM MBAFERGUEZ..vwVentasFerguez V
    WHERE GRUPO = 'CERVEZA'
        AND MESVTA = MONTH(@FECHA)
        AND ANIOVTA = YEAR(@FECHA)
        AND MARCA = 'INDIO'
        AND CUPO = 'NR'  -- Non-returnable format
    GROUP BY CLIENTE_ID, GECS
) IND
    ON CTES.CLIENTE_ID = IND.CLIENTE_ID

-- Indio sales (all formats)
LEFT JOIN (
    SELECT
        CLIENTE_ID,
        SUM(cartones) AS INDIOM
    FROM MBAFERGUEZ..vwVentasFerguez V
    WHERE GRUPO = 'CERVEZA'
        AND MESVTA = MONTH(@FECHA)
        AND ANIOVTA = YEAR(@FECHA)
        AND MARCA = 'INDIO'
    GROUP BY CLIENTE_ID, GECS
) INDM
    ON CTES.CLIENTE_ID = INDM.CLIENTE_ID

-- Tecate sales
LEFT JOIN (
    SELECT
        CLIENTE_ID,
        SUM(cartones) AS TECATE
    FROM MBAFERGUEZ..vwVentasFerguez V
    WHERE GRUPO = 'CERVEZA'
        AND MESVTA = MONTH(@FECHA)
        AND ANIOVTA = YEAR(@FECHA)
        AND MARCA = 'TECATE'
    GROUP BY CLIENTE_ID, GECS
) TC
    ON CTES.CLIENTE_ID = TC.CLIENTE_ID

-- XX Lager sales
LEFT JOIN (
    SELECT
        CLIENTE_ID,
        SUM(cartones) AS XX
    FROM MBAFERGUEZ..vwVentasFerguez V
    WHERE GRUPO = 'CERVEZA'
        AND MESVTA = MONTH(@FECHA)
        AND ANIOVTA = YEAR(@FECHA)
        AND MARCA = 'XX Lager'
    GROUP BY CLIENTE_ID, GECS
) XXL
    ON CTES.CLIENTE_ID = XXL.CLIENTE_ID

-- =====================================================================
-- FINAL FILTER: Apply route filter
-- =====================================================================
WHERE CTES.ruta = '001';

-- =====================================================================
-- END OF QUERY
-- =====================================================================
-- Notes:
-- 1. Replace hardcoded route '001' with @RUTA parameter
-- 2. Day-of-week filter (MARTES=1) should be dynamic based on @FECHA
-- 3. Consider adding ORDER BY clause for consistent sorting
-- 4. Performance optimization: Add indexes on CLIENTE_ID, SEMANA, FECHA
-- =====================================================================
