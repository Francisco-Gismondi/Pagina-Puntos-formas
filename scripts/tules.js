(function () {
  const TULES = {
    "CHON-JI": "30 seg",
    "DAN-GUN": "34 seg",
    "DO-SAN": "41 seg",
    "WON-HYO": "47 seg",
    "YUL-GOK": "52 seg",
    "JOONG-GUN": "55 seg",
    "TOI-GYE": "66 seg",
    "HWA-RANG": "49 seg",
    "CHOONG-MOO": "52 seg",
    "KWANG-GAE": "74 seg",
    "PO-EUN": "44 seg",
    "GE-BAEK": "63 seg",
    "EUI-AM": "74 seg",
    "CHOONG-JANG": "87 seg",
    JUCHE: "100 seg",
    "SAM-IL": "62 seg",
    "YU-SIN": "104 seg",
    "CHOI-YONG": "75 seg",
    "YON-GAE": "87 seg",
    "UL-JI": "66 seg",
    "MOON-MOO": "101 seg",
    "SO-SAN": "110 seg",
    "SE-JONG": "51 seg",
    "CHANG-HON": "94 seg",
  };

  const ordenTules = Object.keys(TULES);

  function generarOpcionesTules() {
    let opciones = '<option value="">-</option>';
    for (const nombre in TULES) {
      opciones += `<option value="${nombre}">${nombre}</option>`;
    }
    return opciones;
  }

  function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function obtenerRangoFormas(categoria) {
    let rango1 = [];
    let rango2 = [];

    switch (categoria) {
      case "1 Gup":
        rango1 = ["HWA-RANG", "CHOONG-MOO"];
        rango2 = ordenTules.slice(
          ordenTules.indexOf("CHON-JI"),
          ordenTules.indexOf("CHOONG-MOO") + 1,
        );
        break;
      case "1er Dan":
        rango1 = ["KWANG-GAE", "PO-EUN", "GE-BAEK"];
        rango2 = ordenTules.slice(
          ordenTules.indexOf("CHON-JI"),
          ordenTules.indexOf("GE-BAEK") + 1,
        );
        break;
      case "2do Dan":
        rango1 = ["EUI-AM", "CHOONG-JANG", "JUCHE"];
        rango2 = ordenTules.slice(
          ordenTules.indexOf("JOONG-GUN"),
          ordenTules.indexOf("JUCHE") + 1,
        );
        break;
      case "3er Dan":
        rango1 = ["SAM-IL", "YU-SIN", "CHOI-YONG"];
        rango2 = ordenTules.slice(
          ordenTules.indexOf("JOONG-GUN"),
          ordenTules.indexOf("CHOI-YONG") + 1,
        );
        break;
      case "4to Dan":
        rango1 = ["YON-GAE", "UL-JI", "MOON-MOO"];
        rango2 = ordenTules.slice(
          ordenTules.indexOf("JOONG-GUN"),
          ordenTules.indexOf("MOON-MOO") + 1,
        );
        break;
      case "5to Dan":
        rango1 = ["SO-SAN", "SE-JONG"];
        rango2 = ordenTules.slice(
          ordenTules.indexOf("JOONG-GUN"),
          ordenTules.indexOf("SE-JONG") + 1,
        );
        break;
      default:
        rango1 = ordenTules.slice(0, ordenTules.indexOf("CHOONG-MOO") + 1);
        rango2 = rango1;
        break;
    }

    return { rango1, rango2 };
  }

  function sortearFormas(categoria, formasExcluidas = []) {
    const { rango1, rango2 } = obtenerRangoFormas(categoria);
    const exclusiones = new Set((formasExcluidas || []).filter(Boolean));

    const rango1Disponible = rango1.filter((forma) => !exclusiones.has(forma));
    const forma1Base = rango1Disponible.length > 0 ? rango1Disponible : rango1;
    const forma1 = getRandomElement(forma1Base);

    exclusiones.add(forma1);

    const rango2Disponible = rango2.filter(
      (forma) => !exclusiones.has(forma) && forma !== forma1,
    );
    const forma2Base =
      rango2Disponible.length > 0
        ? rango2Disponible
        : rango2.filter((forma) => forma !== forma1);
    const forma2 = getRandomElement(forma2Base.length ? forma2Base : rango2);

    return { forma1, forma2 };
  }

  window.TorneoTules = {
    TULES,
    generarOpcionesTules,
    sortearFormas,
    obtenerRangoFormas,
  };
})();
