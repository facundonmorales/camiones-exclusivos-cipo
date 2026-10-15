-- ════════════════════════════════════════════════════════════════
-- Datos iniciales — catálogo real tomado de Instagram (@camionesexclusivoscipo)
-- Publicaciones scrapeadas el 15/10/2026. Se omitieron las marcadas
-- como VENDIDO y las publicaciones sin texto.
--
-- Las fotos se cargan aparte con:  npm run importar-fotos
-- (ver README, sección "Importar fotos de Instagram").
--
-- Se puede correr más de una vez: no duplica unidades (on conflict).
-- ════════════════════════════════════════════════════════════════

-- Si corriste el seed anterior, esto borra las unidades de ejemplo.
delete from public.unidades where titulo like '[EJEMPLO]%';

-- ── Unidades ────────────────────────────────────────────────────
-- ⚠️ Revisar desde el panel:
--   · Volkswagen 31320 6x4: el brief dice 2011 y $110.000.000; el posteo de IG dice 2010.
--   · Ford Cargo 1722 regador: se unificaron dos posteos (1722 2015 y "tanque regador 2015").
--   · Iveco Cursor 330, Actros 2041, Atron 1634 y Scania G380: el posteo no dice el año.
insert into public.unidades
  (slug, marca, modelo, titulo, categoria, condicion, anio, km, traccion,
   descripcion_corta, descripcion, especificaciones, moneda, precio,
   acepta_financiacion, acepta_canje, entrega_inmediata, estado, visible, destacada, orden,
   created_at, updated_at)
values
  ('volkswagen-31320-2011', 'Volkswagen', '31320', 'Volkswagen 31320 6x4', 'camion', 'usado', 2011, null, '6x4',
   'Camión 6x4 listo para trabajar. Con financiación.',
   E'Volkswagen 31320 6x4, unidad en muy buen estado y lista para trabajar.\n\nMotor potente y confiable, cabina amplia y cómoda, ideal para transporte y trabajo pesado. Entrega inmediata, con opción de financiación y permuta.',
   '[{"clave": "Marca", "valor": "Volkswagen"}, {"clave": "Modelo", "valor": "31320"}, {"clave": "Tracción", "valor": "6x4"}]'::jsonb, 'ARS', 110000000, true, true, true, 'disponible', true, true, 0, '2026-09-02T21:08:55Z', '2026-09-02T21:08:55Z'),
  ('iveco-stralis-360-2017', 'Iveco', 'Stralis 360', 'Iveco Stralis 360 6x2 automático', 'camion', 'usado', 2017, null, '6x2',
   'Caja automática. Hay 2 unidades iguales disponibles.',
   E'Iveco Stralis 360 6x2, modelo 2017, con caja automática. Tenemos dos unidades iguales disponibles.\n\nConsultá por disponibilidad, condiciones y financiación. Recibimos permutas.',
   '[{"clave": "Caja", "valor": "Automática"}, {"clave": "Configuración", "valor": "6x2"}, {"clave": "Unidades disponibles", "valor": "2"}]'::jsonb, 'ARS', 125000000, true, true, false, 'disponible', true, true, 0, '2026-10-14T14:11:54Z', '2026-10-14T14:11:54Z'),
  ('ford-cargo-1517-2005', 'Ford', 'Cargo 1517', 'Ford Cargo 1517 con playa plana', 'camion', 'usado', 2005, null, null,
   'Motor Cummins 6BT, playa plana de 8 m. Papeles al día.',
   E'Ford Cargo 1517 modelo 2005, con el confiable motor Cummins 6BT. Muy entero, con chapa y pintura muy buena para el modelo.\n\nPlaya plana larga de unos 8 metros, bien reforzada, ideal para 12 pallets, maquinaria o fardos. Cabina dormitorio con climatizador y 6 cubiertas en muy buen estado.\n\nTitular al día, listo para transferir. Ideal para trabajo pesado, reparto, campo o corralón. Tomamos permuta menor más diferencia.',
   '[{"clave": "Motor", "valor": "Cummins 6BT 170 HP, original"}, {"clave": "Caja", "valor": "Eaton Fuller de 5 marchas"}, {"clave": "Cabina", "valor": "Dormitorio con climatizador"}, {"clave": "Carrocería", "valor": "Playa plana de 8 m aprox., reforzada"}, {"clave": "Rodado", "valor": "Dual, suspensión a elástico"}, {"clave": "Cubiertas", "valor": "6, muy buenas"}]'::jsonb, 'ARS', 42000000, true, true, false, 'disponible', true, false, 0, '2026-10-02T20:26:08Z', '2026-10-02T20:26:08Z'),
  ('mercedes-benz-1624-2007', 'Mercedes-Benz', '1624', 'Mercedes-Benz 1624 tractor', 'tractor', 'usado', 2007, null, null,
   'Tractor con cabina dormitorio, listo para trabajar.',
   E'Mercedes-Benz 1624 tractor, modelo 2007. Motor de 6 cilindros, cabina dormitorio y excelente estado general.\n\nIdeal para trabajo y larga distancia. Documentación al día. Recibimos tu usado y financiamos.',
   '[{"clave": "Configuración", "valor": "Tractor"}, {"clave": "Motor", "valor": "6 cilindros"}, {"clave": "Cabina", "valor": "Dormitorio"}]'::jsonb, 'ARS', 60000000, true, true, false, 'disponible', true, false, 0, '2026-10-02T20:07:27Z', '2026-10-02T20:07:27Z'),
  ('ford-cargo-1722-regador-2015', 'Ford', 'Cargo 1722', 'Ford Cargo 1722 con tanque regador 10.000 L', 'camion', 'usado', 2015, null, null,
   'Tanque regador de 10.000 litros. Excelente estado.',
   E'Ford Cargo 1722 modelo 2015 con tanque regador de 10.000 litros.\n\nIdeal para riego, obras y mantenimiento de calles. Excelente estado general y listo para trabajar. Recibimos permuta y financiamos.',
   '[{"clave": "Equipo", "valor": "Tanque regador"}, {"clave": "Capacidad", "valor": "10.000 litros"}]'::jsonb, 'ARS', 75000000, true, true, false, 'disponible', true, false, 0, '2026-09-25T11:34:32Z', '2026-09-25T11:34:32Z'),
  ('iveco-tector-170e25-2012', 'Iveco', 'Tector 170E25', 'Iveco Tector 170E25 tractor', 'tractor', 'usado', 2012, null, null,
   'Tractor en muy buen estado. Documentación al día.',
   E'Iveco Tector 170E25 tractor, modelo 2012. Muy buen estado general y documentación al día.\n\nRecibimos permuta y consultá por financiación.',
   '[{"clave": "Configuración", "valor": "Tractor"}, {"clave": "Motor", "valor": "170E25"}]'::jsonb, 'ARS', 59000000, true, true, false, 'disponible', true, false, 0, '2026-09-24T11:42:35Z', '2026-09-24T11:42:35Z'),
  ('volvo-vm-310-2013', 'Volvo', 'VM 310', 'Volvo VM 310', 'camion', 'usado', 2013, 336000, null,
   '336.000 km. Cabina cómoda y bajo consumo.',
   E'Volvo VM 310 modelo 2013, con 336.000 km. Motor Volvo de excelente rendimiento, cabina cómoda y espaciosa, bajo consumo y gran desempeño en ruta.\n\nUnidad lista para trabajar. Consultanos por financiación y permuta.',
   '[]'::jsonb, 'ARS', 68000000, true, true, false, 'disponible', true, false, 0, '2026-09-22T18:19:08Z', '2026-09-22T18:19:08Z'),
  ('ford-cargo-1932-2013', 'Ford', 'Cargo 1932', 'Ford Cargo 1932', 'camion', 'usado', 2013, null, null,
   'Muy buena presencia y estado general.',
   E'Ford Cargo 1932 modelo 2013. Potencia y confiabilidad, con muy buena presencia y estado general. Listo para trabajar.\n\nRecibimos permuta y consultá las opciones de financiación.',
   '[]'::jsonb, 'ARS', null, true, true, false, 'disponible', true, false, 0, '2026-09-17T13:06:51Z', '2026-09-17T13:06:51Z'),
  ('scania-g340-2011', 'Scania', 'G340', 'Scania G340 tractor', 'tractor', 'usado', 2011, null, null,
   'Tractor con cabina Streamline. Excelente presencia.',
   E'Scania G340 tractor, modelo 2011, con cabina Streamline. Excelente presencia y estado general, ideal para trabajo pesado.\n\nDocumentación al día. Recibimos permuta, con posibilidad de financiación.',
   '[{"clave": "Configuración", "valor": "Tractor"}, {"clave": "Cabina", "valor": "Streamline"}]'::jsonb, 'ARS', null, true, true, false, 'disponible', true, false, 0, '2026-09-16T16:24:59Z', '2026-09-16T16:24:59Z'),
  ('mercedes-benz-1114-1973', 'Mercedes-Benz', '1114', 'Mercedes-Benz 1114 volcador', 'volcador', 'usado', 1973, null, null,
   'Con volcadora. Precio de contado.',
   E'Mercedes-Benz 1114 año 1973 con volcadora, listo para trabajar. Un camión firme y confiable, con excelente presencia.\n\nIdeal para construcción, movimiento de materiales y tareas pesadas. Precio de contado.',
   '[{"clave": "Carrocería", "valor": "Volcadora"}]'::jsonb, 'ARS', 25000000, false, false, false, 'disponible', true, false, 0, '2026-09-03T12:42:11Z', '2026-09-03T12:42:11Z'),
  ('ford-cargo-1932-2014', 'Ford', 'Cargo 1932', 'Ford Cargo 1932', 'camion', 'usado', 2014, null, null,
   'Cabina dormitorio. Excelente estado general.',
   E'Ford Cargo 1932 modelo 2014. Potencia y rendimiento, cabina dormitorio y excelente estado general. Documentación al día, listo para trabajar.\n\nRecibimos tu usado y tenemos financiación disponible.',
   '[{"clave": "Cabina", "valor": "Dormitorio"}]'::jsonb, 'ARS', null, true, true, false, 'disponible', true, false, 0, '2026-08-24T13:13:40Z', '2026-08-24T13:13:40Z'),
  ('volkswagen-19-320-2012', 'Volkswagen', '19-320', 'Volkswagen 19-320', 'camion', 'usado', 2012, null, null,
   'Motor de 320 CV. Ideal para larga distancia.',
   E'Volkswagen 19-320 modelo 2012, con motor de 320 CV. Excelente estado general y muy buena presentación. Documentación al día.\n\nIdeal para trabajo y larga distancia. Consultá precio y condiciones.',
   '[{"clave": "Potencia", "valor": "320 CV"}]'::jsonb, 'ARS', null, false, false, false, 'disponible', true, false, 0, '2026-08-24T12:19:22Z', '2026-08-24T12:19:22Z'),
  ('volkswagen-17-220-2012', 'Volkswagen', '17-220', 'Volkswagen 17-220', 'camion', 'usado', 2012, null, null,
   'Excelente estado. Financiamos con entrega del 50%.',
   E'Volkswagen 17-220 modelo 2012 en excelente estado.\n\nRecibimos permuta y financiamos con una entrega del 50%.',
   '[]'::jsonb, 'ARS', null, true, true, false, 'disponible', true, false, 0, '2026-08-18T15:50:28Z', '2026-08-18T15:50:28Z'),
  ('iveco-cursor-330', 'Iveco', 'Cursor 330', 'Iveco Cursor 330 tractor', 'tractor', 'usado', null, null, null,
   'Tractor de ruta con cabina dormitorio.',
   E'Iveco Cursor 330, tractor de carretera con cabina dormitorio. Excelente presentación y estado general, listo para trabajar.\n\nMuy buena opción para transporte y larga distancia. Financiación y entrega a convenir, tomamos permutas.',
   '[{"clave": "Configuración", "valor": "Tractor"}, {"clave": "Cabina", "valor": "Dormitorio"}]'::jsonb, 'ARS', null, true, true, false, 'disponible', true, false, 0, '2026-08-31T17:29:22Z', '2026-08-31T17:29:22Z'),
  ('mercedes-benz-actros-2041', 'Mercedes-Benz', 'Actros 2041', 'Mercedes-Benz Actros 2041 tractor', 'tractor', 'usado', null, null, null,
   'Tractor de ruta con cabina techo alto.',
   E'Mercedes-Benz Actros 2041, tractor de ruta con cabina techo alto. Excelente estado general.\n\nUna unidad ideal para quienes buscan rendimiento, confiabilidad y confort. Financiación adaptada a tus posibilidades.',
   '[{"clave": "Configuración", "valor": "Tractor"}, {"clave": "Cabina", "valor": "Techo alto"}]'::jsonb, 'ARS', null, true, false, false, 'disponible', true, false, 0, '2026-08-31T17:42:15Z', '2026-08-31T17:42:15Z'),
  ('volkswagen-17-220-2011', 'Volkswagen', '17-220', 'Volkswagen 17-220 tractor', 'tractor', 'usado', 2011, null, null,
   'Tractor en muy buen estado general.',
   E'Volkswagen 17-220 tractor, modelo 2011. Muy buen estado general e interior en buenas condiciones. Documentación al día, listo para trabajar.\n\nRecibimos tu usado y tenemos financiación disponible.',
   '[{"clave": "Configuración", "valor": "Tractor"}]'::jsonb, 'ARS', null, true, true, false, 'disponible', true, false, 0, '2026-08-24T13:33:45Z', '2026-08-24T13:33:45Z'),
  ('iveco-stralis-460-2013', 'Iveco', 'Stralis 460', 'Iveco Stralis 460', 'camion', 'usado', 2013, null, null,
   '460 HP, cabina dormitorio. Excelente estado.',
   E'Iveco Stralis modelo 2013, con motor de 460 HP y cabina dormitorio. Excelente estado general, documentación al día y listo para trabajar.\n\nRecibimos tu usado y tenemos financiación disponible.',
   '[{"clave": "Potencia", "valor": "460 HP"}, {"clave": "Cabina", "valor": "Dormitorio"}]'::jsonb, 'ARS', null, true, true, false, 'disponible', true, false, 0, '2026-08-24T13:05:12Z', '2026-08-24T13:05:12Z'),
  ('mercedes-benz-ls-1634-2006', 'Mercedes-Benz', 'LS 1634', 'Mercedes-Benz LS 1634', 'tractor', 'usado', 2006, 600000, null,
   '600.000 km, motor a bomba.',
   E'Mercedes-Benz LS 1634 modelo 2006, con 600.000 km y motor a bomba. Una excelente oportunidad de trabajo.\n\nFinanciamos: entregás el 50% y financiamos el saldo. Recibimos vehículos en parte de pago.',
   '[{"clave": "Motor", "valor": "A bomba"}]'::jsonb, 'ARS', null, true, true, false, 'disponible', true, false, 0, '2026-08-18T15:37:30Z', '2026-08-18T15:37:30Z'),
  ('mercedes-benz-atron-1634', 'Mercedes-Benz', 'Atron 1634', 'Mercedes-Benz Atron 1634', 'camion', 'usado', null, null, null,
   'Excelente estado, listo para trabajar.',
   E'Mercedes-Benz Atron 1634 en excelente estado, listo para trabajar. Motor Mercedes-Benz de gran desempeño, ideal para transporte de cargas y largas distancias.\n\nFinanciamos hasta el 50% del valor en hasta 18 cuotas y aceptamos cheques o documentos. Recibimos tu usado en parte de pago.',
   '[]'::jsonb, 'ARS', null, true, true, false, 'disponible', true, false, 0, '2026-07-17T17:03:24Z', '2026-07-17T17:03:24Z'),
  ('iveco-tector-170e25-chasis-2014', 'Iveco', 'Tector 170E25', 'Iveco Tector 170E25 chasis', 'chasis', 'usado', 2014, null, null,
   'Chasis ideal para carrozar.',
   E'Iveco Tector 170E25 chasis, año 2014. Motor Iveco de excelente desempeño, ideal para carrozar y adaptarse a distintos tipos de trabajo. Unidad lista para trabajar.\n\nFinanciamos hasta el 50% del valor en hasta 18 cuotas y aceptamos cheques o documentos. Recibimos tu usado en parte de pago.',
   '[{"clave": "Configuración", "valor": "Chasis"}]'::jsonb, 'ARS', null, true, true, false, 'disponible', true, false, 0, '2026-07-17T17:11:27Z', '2026-07-17T17:11:27Z'),
  ('mercedes-benz-actros-2636-2014', 'Mercedes-Benz', 'Actros 2636', 'Mercedes-Benz Actros 2636', 'camion', 'usado', 2014, null, null,
   'Eje neumático. Máximo confort en ruta.',
   E'Mercedes-Benz Actros 2636 año 2014, con eje neumático. Excelente estado, listo para trabajar, con máximo confort y rendimiento en ruta.\n\nFinanciamos hasta el 50% del valor en hasta 18 cuotas y aceptamos cheques o documentos. Recibimos tu usado en parte de pago.',
   '[{"clave": "Eje", "valor": "Neumático"}]'::jsonb, 'ARS', null, true, true, false, 'disponible', true, false, 0, '2026-07-17T15:10:30Z', '2026-07-17T15:10:30Z'),
  ('renault-premium-380-2015', 'Renault', 'Premium 380', 'Renault Premium 380 6x2', 'camion', 'usado', 2015, null, '6x2',
   'Excelente mecánica y muy buen estado general.',
   E'Renault Premium 380 año 2015, configuración 6x2. Excelente mecánica, muy buen estado general y listo para trabajar. Una unidad fuerte y confiable.\n\nTomamos permutas y tenemos financiación disponible.',
   '[{"clave": "Configuración", "valor": "6x2"}]'::jsonb, 'ARS', null, true, true, false, 'disponible', true, false, 0, '2026-07-25T15:58:08Z', '2026-07-25T15:58:08Z'),
  ('mercedes-benz-1721-regador-2023', 'Mercedes-Benz', '1721', 'Mercedes-Benz 1721 regador 10.000 L', 'camion', 'usado', 2023, 13000, null,
   'Solo 13.000 km. Tanque regador de 10.000 litros.',
   'Mercedes-Benz 1721 año 2023 con tanque regador de 10.000 litros y solo 13.000 km. Una oportunidad única, listo para trabajar hoy.',
   '[{"clave": "Equipo", "valor": "Tanque regador"}, {"clave": "Capacidad", "valor": "10.000 litros"}]'::jsonb, 'USD', 85000, false, false, true, 'disponible', true, true, 0, '2026-05-04T21:26:18Z', '2026-05-04T21:26:18Z'),
  ('scania-g380', 'Scania', 'G380', 'Scania G380', 'camion', 'usado', null, null, null,
   'Cabina amplia, bajo consumo y gran eficiencia.',
   E'Scania G380 con motor de excelente desempeño, cabina amplia y confortable, bajo consumo y gran eficiencia en ruta. Unidad lista para trabajar.\n\nFinanciamos hasta el 50% del valor en hasta 18 cuotas y aceptamos cheques o documentos. Recibimos tu usado en parte de pago.',
   '[]'::jsonb, 'ARS', null, true, true, false, 'disponible', true, false, 0, '2026-07-17T16:18:16Z', '2026-07-17T16:18:16Z')
on conflict (slug) do nothing;

