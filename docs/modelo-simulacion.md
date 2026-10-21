# Modelo de simulación solar y equipos

El simulador permite editar paneles, inversores y baterías dentro de la pestaña **Simulador Personalizado**. Los valores iniciales son ejemplos, no recomendaciones de compra ni fichas de fabricantes. Las características adicionales (por ejemplo Voc, Vmp, rango MPPT, química o garantía) son descriptivas y **no intervienen en las ecuaciones ni validan compatibilidad eléctrica**. Los cambios permanecen en la sesión del componente; no se guardan en un catálogo o servidor. Reiniciar restaura los ejemplos.

## Revisión del cálculo anterior

El cálculo anterior dividía la potencia nominal requerida por la eficiencia del panel. Esa eficiencia ya está incorporada en la potencia Wp de su ficha técnica: usar 20% multiplicaba por cinco el dimensionamiento. También fijaba paneles de 400 W, suponía que todo el consumo se ahorraba, aplicaba factores arbitrarios en sensibilidad y multiplicadores de inversión distintos entre gráficos y resumen. No comprobaba balances de energía y dividía por cero cuando no había consumo. Los resultados mezclaban datos calculados con entradas editadas posteriormente.

Ahora el cálculo es una función pura en `src/modules/solar/model.ts`, con validación explícita. La interfaz conserva una copia de las entradas y resultados de cada ejecución y marca los cambios pendientes de recalcular. La eficiencia del panel solo estima el área. Los ahorros proceden de la energía solar efectivamente suministrada a la carga, incluida la descargada de batería.

## Alcance y unidades

Este es un modelo educativo de despacho sobre un perfil **sintético**. No implementa PVWatts ni SAM; toma relaciones físicas documentadas y simplifica el clima y la demanda. No es un diseño eléctrico, una predicción de producción garantizada o un cálculo de autonomía.

- Potencia de panel: Wp a condiciones estándar (STC: irradiancia 1 kW/m², célula a 25 °C).
- Potencia del sistema e inversor: kWp DC y kW AC, respectivamente.
- Energía: kWh. Temperatura: °C de célula, no temperatura ambiente.
- HSP: irradiación diaria sobre el plano del panel (kWh/m²/día) dividida por la irradiancia de referencia (1 kW/m²). No son horas de luz. El usuario debe suministrar una estimación apropiada al plano/orientación; no se transforma GHI en irradiación inclinada.
- Eficiencias y pérdidas se introducen en porcentaje y se convierten a fracciones para operar.
- Tarifas: COP/kWh. Inversión y mantenimiento: COP.

## Perfil solar y producción

Cada mes contiene 30 días idénticos de 24 intervalos de una hora, con generación entre 06:00 y 18:00. Para `j = 0…11`:

```
w[j] = sin(π × (j + 0,5) / 12)
g[j] = HSP × w[j] / suma(w)
Pstc = cantidadPaneles × WpPorPanel / 1000
fT = max(0, 1 + (coeficienteTérmicoPorcentaje / 100) × (Tcélula − 25))
Pdc[j] = Pstc × g[j] × fT × (1 − otrasPérdidas / 100)
Pac[j] = min(Pdc[j] × eficienciaInversor / 100, potenciaACInversor)
Eac[j] = Pac[j] × 1 hora
```

`g` representa irradiancia normalizada, con integral diaria igual a HSP. Es una construcción del proyecto; un HSP alto puede implicar picos normalizados superiores a uno. El inversor aplica eficiencia constante y límite de potencia, sin curvas de eficiencia ni consumo en espera. La temperatura de célula permanece constante; no se estima a partir del ambiente. Las pérdidas por temperatura, inversor y batería son independientes de “otras pérdidas”.

El 14% de otras pérdidas y el 96% del inversor son ejemplos basados en valores predeterminados de PVWatts, no mediciones del sitio. El coeficiente térmico debe sustituirse por el de la ficha técnica.

## Demanda, batería y balances

El porcentaje de consumo diurno reparte esa parte del consumo mensual uniformemente entre las 12 horas diurnas; el resto se reparte entre las 12 nocturnas. La producción solar atiende primero esa demanda. Los excedentes cargan la batería; el sobrante se exporta sin remuneración. Los déficits se cubren primero con batería. En on-grid el resto procede de la red; en off-grid queda como demanda sin cubrir. Los excedentes se exportan en on-grid y se descartan en off-grid.

La batería es un almacenamiento equivalente acoplado en AC. El banco empieza vacío respecto de su ventana utilizable, sin carga desde red. La energía almacenada se mantiene entre horas y días; no se reinicia cada noche.

```
CapacidadNominal = cantidad × capacidadPorBatería
CapacidadUtilizable = CapacidadNominal × profundidadDescarga / 100
ηcarga = ηdescarga = sqrt(eficienciaCiclo / 100)
cargaAC = min(excedente, potenciaCargaPorBatería × cantidad × 1h,
              (CapacidadUtilizable − energíaAlmacenada) / ηcarga)
energíaAlmacenada += cargaAC × ηcarga
descargaAC = min(déficit, potenciaDescargaPorBatería × cantidad × 1h,
                 energíaAlmacenada × ηdescarga)
energíaAlmacenada -= descargaAC / ηdescarga
pérdidas = cargaAC × (1 − ηcarga) + descargaAC × (1/ηdescarga − 1)
```

Las potencias de carga y descarga son **por batería**, mientras que el límite del inversor es la **potencia AC total fotovoltaica**. En on-grid, este almacenamiento AC equivalente tiene sus propios límites. En off-grid, además se limita la suma de suministro directo y descarga a la potencia AC del inversor; es un modelo equivalente simplificado, no una comprobación de topología o compatibilidad de un inversor híbrido. No se simulan voltajes, corrientes, envejecimiento, autodescarga, reservas adicionales ni pérdidas en espera. La eficiencia de ciclo debe corresponder al almacenamiento AC equivalente para evitar omitir o duplicar conversiones.

Con batería inicialmente vacía, los tests verifican:

```
consumo = autoconsumoSolar + compraRed + demandaSinCubrir
generaciónAC = autoconsumoSolar + exportación + excedenteDescartado + pérdidasBatería + energíaFinal
cargaAC = descargaAC + pérdidasBatería + energíaFinal
```

## Dimensionamiento y área

```
fRendimiento = fT × (1 − otrasPérdidas/100) × eficienciaInversor/100
kWpOrientativos = consumoMensual / (30 × HSP × fRendimiento)
panelesOrientativos = techo(kWpOrientativos × 1000 / WpPorPanel)
áreaMódulos = kWpInstalados / (eficienciaPanel/100 × 1 kW/m²)
```

El dimensionamiento orientativo no cambia automáticamente los equipos. Ignora el recorte del inversor, el horario de demanda y las pérdidas de almacenamiento: no garantiza cubrir todo el consumo. Con rendimiento nulo no se presenta sugerencia. El área excluye separación, pasillos y geometría de cubierta.

## Finanzas y sensibilidad

Estas métricas de ahorro de factura se aplican a **on-grid**. En off-grid no hay
compras de red evitadas: se muestran inversión y mantenimiento, pero no
ahorro de factura ni recuperación sin definir una alternativa de suministro.

```
ahorroAnualBruto = autoconsumoMensual × 12 × tarifa
ahorroAnualNeto = ahorroAnualBruto − mantenimientoAnual
recuperaciónSimple = inversiónTotal / ahorroAnualNeto
balanceSimple10Años = 10 × ahorroAnualNeto − inversiónTotal
```

Si el ahorro neto es cero o negativo, la recuperación se presenta como no disponible. La inversión manual incluye todos los equipos y la instalación; no se añaden costos otra vez. No se ahorran cargos fijos de factura ni se valoran excedentes. El mes se multiplica por 12, equivalente a **360 días sintéticos**. No incluye estacionalidad, degradación, inflación, descuento, financiación, impuestos, incentivos ni reemplazos. La recuperación simple supone flujo anual constante; no sustituye un análisis financiero con flujos variables.

La sensibilidad vuelve a ejecutar el mismo modelo con tarifa ±20%, inversión −20% y HSP ±20%; HSP se limita al intervalo validado de 0,01 a 12 y tarifa al máximo validado de 1.000.000 COP/kWh.

## Ejemplo reproducible

Con 250 kWh/mes, 5 HSP, cinco paneles de 400 Wp, 20% de eficiencia de panel, célula a 25 °C, otras pérdidas del 14%, inversor de 2 kW y eficiencia del 96%:

- Potencia instalada: 2 kWp; área de módulos: 10 m².
- Producción sin recorte: `2 × 5 × 30 × 0,86 × 0,96 = 247,68 kWh/mes`.
- Dimensionamiento por energía: 2,01873385 kWp, redondeado a seis paneles de 400 Wp.
- Con consumo diurno del 50% y sin batería: autoconsumo ≈112,606158 kWh, red ≈137,393842 kWh, excedentes ≈135,073842 kWh.
- A 454 COP/kWh y 9.500.000 COP de inversión, sin mantenimiento: recuperación simple ≈15,485469 años.
- Si la célula sube a 45 °C con coeficiente −0,35%/°C, el factor térmico es 0,93 y la producción es 230,3424 kWh/mes.
- Dos baterías de 5 kWh con 80% de profundidad utilizable proporcionan 8 kWh de ventana útil. Con ciclo del 81%, 1 kWh AC cargado almacena 0,9 kWh y permite entregar 0,81 kWh AC si luego se descarga completamente.

## Fuentes técnicas

Consultadas el 21 de octubre de 2026:

- [PVWatts: pérdidas del sistema](https://pvwatts.nlr.gov/docs/help_system_sysloss.php): pérdidas de sistema separadas de la eficiencia del inversor; valores predeterminados usados como ejemplos.
- [SAM: diseño del sistema PVWatts](https://samrepo.nlr.gov/help/pvwatts_system_design.html): potencia nominal STC, área y límite AC del inversor.
- [pvlib: ecuación DC PVWatts](https://pvlib-python.readthedocs.io/en/v0.10.3/reference/generated/pvlib.pvsystem.pvwatts_dc.html): dependencia de potencia con irradiancia y temperatura de célula.
- [SAM: resultados de baterías](https://samrepo.nlr.gov/help/battery_results.html): eficiencia de ciclo como energía de salida respecto de entrada. El reparto simétrico mediante raíz cuadrada es una hipótesis de este modelo.
- [SAM: almacenamiento detrás del contador](https://samrepo.nlr.gov/help/battery_storage_btm.html): capacidad y profundidad de descarga.
- [SAM: recuperación de inversión](https://samrepo.nlr.gov/help/mtf_payback.html): recuperación de costos mediante ahorros acumulados y limitaciones ante flujos irregulares.

Para extender el modelo, añada propiedades tipadas, validación, ecuaciones y pruebas de balance en el módulo solar, después exponga los campos en el editor. Añadir una fila descriptiva por sí solo no cambia la física.


## Tipo de proyecto y mínimos sugeridos

La selección **On-grid / Off-grid** forma parte de cada resultado guardado.
Cambiarla requiere recalcular. Los gráficos muestran balance mensual, perfil
horario del día 30, sensibilidad y, en on-grid, balance financiero acumulado.
Las tablas se conservan como alternativa accesible.

Las sugerencias en `src/modules/solar/sizing.ts` comparan el equipo configurado
con un objetivo definido y muestran por debajo, igual o por encima. Estar por
encima puede aportar margen y no constituye un error.

- **On-grid, paneles:** objetivo de producción equivalente al consumo mensual,
  con el cálculo energético anterior; no garantiza autoconsumo del 100%.
- **On-grid, baterías:** mínimo obligatorio cero. Si se activa almacenamiento,
  el objetivo opcional es cubrir la energía nocturna, con suficiente capacidad
  utilizable y potencia. La disponibilidad de excedentes sigue condicionando
  el resultado. Si está desactivado, se muestra esa cantidad como alternativa.
- **Off-grid, baterías:** se introducen autonomía de 1 a 7 días y pico de carga
  simultánea en kW. La cantidad propuesta es el máximo de los límites de
  energía, descarga y carga indicados abajo. Se supone banco lleno al inicio
  del evento sin sol para dimensionar autonomía, pero la simulación mensual
  sigue comenzando vacío.
- **Off-grid, paneles:** se busca por bisección el menor número entero de
  paneles cuyo día 30 no tenga demanda sin cubrir, usando el banco propuesto
  y un inversor sin recorte. Esto verifica un día sintético recurrente y no
  garantiza suministro durante el arranque ni durante mal tiempo.
- **Inversor:** potencia sugerida para evitar recorte con el mayor campo entre
  el configurado y el sugerido bajo el perfil solar utilizado. En off-grid se
  toma además el máximo con el pico simultáneo ingresado y con la carga horaria
  sintética. El equipo debe admitir operación aislada/formadora de red; el modelo
  no comprueba que una ficha comercial realmente lo soporte.

```
energíaAutonomíaAC = consumoMensual / 30 × díasAutonomía
energíaÚtilACPorBatería = capacidadNominal × DoD × sqrt(eficienciaCiclo)
Nenergía = techo(energíaObjetivoAC / energíaÚtilACPorBatería)
Ndescarga = techo(potenciaCargaEléctricaObjetivo / potenciaDescargaPorBatería)
Ncarga = techo(energíaNocturna / (eficienciaCiclo × 12h × potenciaCargaPorBatería))
Nbaterías = máximo(Nenergía, Ndescarga, Ncarga)
```

En on-grid, energíaObjetivoAC es la energía nocturna y la potencia objetivo es
su media horaria; en off-grid son la energía de autonomía y la carga simultánea.
Las sugerencias son un conjunto: aumentar solo paneles puede dejar limitados el
inversor o la batería. No se cambia automáticamente el equipo ni la inversión.
La búsqueda tiene límites explícitos de 100.000 unidades y potencia del modelo;
si no encuentra solución lo indica en lugar de presentar una cantidad ficticia.
Una ficha de batería desactivada inválida se reemplaza solo en la sugerencia
por la ficha de ejemplo y se informa al usuario.

El pico simultáneo es una entrada de dimensionamiento, no un perfil nuevo de
consumo. Verifique aparte potencia de arranque, tensión, Voc, rango MPPT y
corriente. Dimensionar con HSP medias no sustituye datos horarios de largo
plazo ni diseño para el peor periodo meteorológico.

Referencias adicionales:

- [Sandia: datos solares para sistemas aislados](https://www.sandia.gov/research/publications/details/the-synthesis-of-solar-radiation-data-for-sizing-stand-alone-photovoltaic-s-1990-01-01/): importancia de datos horarios de largo plazo.
- [DOE: inversores e integración](https://www.energy.gov/cmei/systems/solar-integration-inverters-and-grid-services-basics): operación sin apoyo de red requiere inversores preparados para ello.
- [Gobierno de Australia: baterías](https://www.energy.gov.au/solar/get-know-solar-technology/batteries): capacidad energética y potencia de salida condicionan cargas atendidas.
