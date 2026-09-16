/**
 * maps.js — Interactive Geo-Maps for China Educational Website
 *
 * Uses CartoDB Voyager (No 403 blocks on file://) + Esri Satellite & Topo basemaps
 * Includes:
 * 1. Industrial Zones Map (Document 5 — Slide 1)
 *    - Japanese colonial legacy (Manchuria)
 *    - Maoist era heavy industry (1949-1976)
 *    - Modern opening-up coastal zones (SEZ)
 *    - Major diversified industrial poles & specialized industries
 * 2. Agricultural Zones Map (Document 3 — Slide 2)
 *    - Extensive pastoral & livestock grazing (West/North-West)
 *    - Cereal crops with industrial crops (North & Manchuria)
 *    - Tropical / Subtropical crops: rice, tea (South)
 *    - Oasis agriculture (Western desert oases)
 *    - Major rivers & geographic landmarks
 * 3. Trilingual legend and tooltip updates on language switch
 */

(function () {
  'use strict';

  // Map instances
  var industrialMap = null;
  var agriculturalMap = null;
  var industrialLegend = null;
  var agriculturalLegend = null;
  
  window.mapLayers = { industrial: {}, agricultural: {} };

  window.highlightMapLayer = function(mapType, layerId) {
    var map = mapType === 'industrial' ? industrialMap : agriculturalMap;
    var layers = window.mapLayers[mapType][layerId];
    if (!map || !layers) return;

    var bounds = L.latLngBounds();
    var hasBounds = false;

    var layersArray = Array.isArray(layers) ? layers : [layers];

    layersArray.forEach(function(layer) {
      if (layer.getBounds) {
        bounds.extend(layer.getBounds());
        hasBounds = true;
      } else if (layer.getLatLng) {
        bounds.extend([layer.getLatLng()]);
        hasBounds = true;
      }

      if (layer.setStyle && layer.options) {
        var originalColor = layer.options.fillColor;
        var originalBorder = layer.options.color;
        var originalOpacity = layer.options.fillOpacity;
        var originalWeight = layer.options.weight;
        
        layer.setStyle({ fillOpacity: 0.9, weight: 4, color: '#ffff00', fillColor: '#ffff00' });
        setTimeout(function() {
          layer.setStyle({ fillOpacity: originalOpacity, weight: originalWeight, color: originalBorder, fillColor: originalColor });
        }, 1500);
      } else if (layer._icon) {
        // Simple bounce effect for markers
        layer._icon.style.transition = 'transform 0.3s ease';
        layer._icon.style.transform = 'translateY(-15px)';
        setTimeout(function() {
          layer._icon.style.transform = '';
        }, 300);
      }
    });

    if (hasBounds) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 6, animate: true });
    }
  };

  // Base tile layers configurations (Using Google Maps)
  function createBaseLayers() {
    var googleRoad = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 19
    });

    var googleSatellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 19
    });

    var googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 19
    });

    var googleTerrain = L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 19
    });

    return {
      voyager: googleRoad,
      satellite: googleSatellite,
      hybrid: googleHybrid,
      topo: googleTerrain
    };
  }

  // Data definitions with trilingual support
  var mapData = {
    // ==========================================
    // 1. INDUSTRIAL MAP DATA
    // ==========================================
    industrialRegions: [
      {
        id: 'colonial',
        color: '#8e44ad',
        name: {
          fr: 'Industries de la colonisation japonaise (Mandchourie)',
          en: 'Old industries from Japanese colonization (Manchuria)',
          ar: 'صناعات قديمة مرتبطة بالاستعمار الياباني (منشوريا)'
        },
        desc: {
          fr: 'Berceau historique de la sidérurgie et des industries lourdes (Anshan, Shenyang, Dalian).',
          en: 'Historic cradle of steel and heavy industry (Anshan, Shenyang, Dalian).',
          ar: 'المهد التاريخي لصناعة الصلب والصناعات الثقيلة (أنشان، شنيانغ، داليان).'
        },
        coords: [
          [39.5, 119.5], [41.2, 120.5], [43.5, 122.0], [46.0, 123.5],
          [48.0, 126.0], [49.5, 128.5], [48.5, 131.0], [46.5, 132.5],
          [44.0, 131.0], [42.0, 128.0], [40.0, 124.5], [39.0, 122.0],
          [39.5, 119.5]
        ]
      },
      {
        id: 'maoist',
        color: '#16a085',
        name: {
          fr: 'Industries de l\'ère maoïste (1949-1976)',
          en: 'Maoist era industries (1949-1976)',
          ar: 'صناعات قديمة خلال الفترة الماوية (1949-1976)'
        },
        desc: {
          fr: 'Développement de l\'industrie lourde, mécanique et chimique dans les provinces intérieures et le long du fleuve Jaune (Wuhan, Lanzhou, Xi\'an).',
          en: 'Development of heavy, mechanical, and chemical industries in interior provinces and along Yellow River.',
          ar: 'تطوير الصناعات الثقيلة والميكانيكية والكيماوية في المناطق الداخلية وعلى طول النهر الأصفر (ووهان، لانتشو، شيآن).'
        },
        coords: [
          [33.0, 102.5], [36.0, 103.5], [38.5, 106.0], [40.5, 111.0],
          [39.5, 114.5], [37.0, 115.0], [34.5, 114.0], [32.0, 114.5],
          [30.5, 112.0], [29.5, 108.5], [29.5, 104.5], [31.5, 103.0],
          [33.0, 102.5]
        ]
      },
      {
        id: 'modern',
        color: '#f39c12',
        name: {
          fr: 'Industries modernes de l\'ouverture (ZES)',
          en: 'Modern industries of opening-up era (SEZ)',
          ar: 'صناعات حديثة مرتبطة بفترة الانفتاح (المناطق الاقتصادية)'
        },
        desc: {
          fr: 'Façade maritime dynamique tournée vers l\'exportation mondiale, l\'électronique et la haute technologie (Shenzhen, Shanghai, Ningbo).',
          en: 'Dynamic coastal corridor driven by exports, consumer electronics, and high technology.',
          ar: 'الواجهة البحرية الديناميكية الموجهة نحو التصدير العالمي، الإلكترونيات، والتكنولوجيا العالية.'
        },
        coords: [
          [21.5, 110.0], [22.8, 114.5], [24.5, 118.5], [27.5, 121.0],
          [30.5, 122.5], [32.5, 121.5], [35.5, 120.0], [37.5, 121.5],
          [38.5, 118.0], [36.5, 117.0], [34.0, 118.0], [31.5, 119.5],
          [28.0, 118.0], [25.0, 115.5], [22.5, 112.5], [21.5, 110.0]
        ]
      }
    ],

    // Major diversified industrial centers (red circles with pulse effect)
    industrialPoles: [
      {
        name: { fr: 'Pôle Nord (Pékin - Tianjin)', en: 'Northern Hub (Beijing - Tianjin)', ar: 'القطب الشمالي (بكين - تيانجين)' },
        coords: [39.5, 116.8],
        radius: 45000,
        desc: {
          fr: 'Centre politique, universités, hautes technologies, pétrochimie et métallurgie.',
          en: 'Capital hub, electronics, universities, high-tech, and petrochemicals.',
          ar: 'مركز سياسي، جامعات، تكنولوجيا متقدمة، بتروكيماويات وصناعات معدنية.'
        }
      },
      {
        name: { fr: 'Delta du Yangtsé (Shanghai)', en: 'Yangtze Delta (Shanghai)', ar: 'دلتا نهر يانغتسي (شانغهاي)' },
        coords: [31.2, 121.5],
        radius: 50000,
        desc: {
          fr: 'Premier port mondial, finance, automobile, microélectronique et biotechnologies.',
          en: 'World largest port, finance, automotive, microelectronics, and biotech.',
          ar: 'أكبر ميناء في العالم، مالية، سيارات، إلكترونيات دقيقة وتكنولوجيا حيوية.'
        }
      },
      {
        name: { fr: 'Delta de la Rivière des Perles (Canton - Shenzhen)', en: 'Pearl River Delta (Guangzhou - Shenzhen)', ar: 'دلتا نهر اللؤلؤ (غوانغتشو - شينزين)' },
        coords: [22.8, 113.8],
        radius: 48000,
        desc: {
          fr: 'Atelier du monde, berceau des ZES, smartphones, robotique et télécommunications.',
          en: 'Silicon Delta of China, birth of SEZ, robotics, consumer electronics, and telecom.',
          ar: 'ورشة العالم، مهد المناطق الاقتصادية الخاصة، هواتف ذكية، روبوتات واتصالات.'
        }
      }
    ],

    // Specialized cities and industries
    industrialCities: [
      {
        name: { fr: 'Pékin (Beijing)', en: 'Beijing', ar: 'بكين' },
        type: 'hightech',
        coords: [39.9, 116.4],
        sector: { fr: 'Haute Technologie & Services', en: 'High-Tech & Services', ar: 'تكنولوجيا عالية وخدمات' }
      },
      {
        name: { fr: 'Shenyang', en: 'Shenyang', ar: 'شنيانغ' },
        type: 'mechanical',
        coords: [41.8, 123.4],
        sector: { fr: 'Constructions mécaniques et aéronautique', en: 'Mechanical & aerospace', ar: 'صناعة ميكانيكية وطيران' }
      },
      {
        name: { fr: 'Anshan', en: 'Anshan', ar: 'أنشان' },
        type: 'steel',
        coords: [41.1, 122.9],
        sector: { fr: 'Capitale chinoise de la sidérurgie (acier)', en: 'Steel & metallurgy capital', ar: 'عاصمة الصلب والتعدين' }
      },
      {
        name: { fr: 'Tianjin', en: 'Tianjin', ar: 'تيانجين' },
        type: 'chemical',
        coords: [39.1, 117.2],
        sector: { fr: 'Pétrochimie et machinerie lourde', en: 'Petrochemicals & machinery', ar: 'بتروكيماويات وآلات ثقيلة' }
      },
      {
        name: { fr: 'Wuhan', en: 'Wuhan', ar: 'ووهان' },
        type: 'steel',
        coords: [30.6, 114.3],
        sector: { fr: 'Sidérurgie, automobile et optique', en: 'Steel, automotive & photonics', ar: 'صناعة الصلب والسيارات والبصريات' }
      },
      {
        name: { fr: 'Shanghai', en: 'Shanghai', ar: 'شانغهاي' },
        type: 'hightech',
        coords: [31.2, 121.5],
        sector: { fr: 'Construction navale, électronique, chimie', en: 'Shipbuilding, electronics & chemicals', ar: 'بناء السفن، إلكترونيات وكيمياء' }
      },
      {
        name: { fr: 'Shenzhen', en: 'Shenzhen', ar: 'شينزين' },
        type: 'hightech',
        coords: [22.5, 114.1],
        sector: { fr: 'Première ZES (1980), capitale mondiale des technologies', en: 'First SEZ (1980), global tech hub', ar: 'أول منطقة اقتصادية خاصة (1980)، قطب تكنولوجي عالمي' }
      },
      {
        name: { fr: 'Lanzhou', en: 'Lanzhou', ar: 'لانتشو' },
        type: 'chemical',
        coords: [36.0, 103.8],
        sector: { fr: 'Raffinage pétrolier et chimie lourde', en: 'Petroleum refining & chemicals', ar: 'تكرير البترول وصناعات كيماوية' }
      },
      {
        name: { fr: 'Chongqing', en: 'Chongqing', ar: 'تشونغتشينغ' },
        type: 'mechanical',
        coords: [29.6, 106.5],
        sector: { fr: 'Premier pôle automobile et motocycles de l\'intérieur', en: 'Automotive & manufacturing metropolis', ar: 'أكبر قطب لصناعة السيارات والدراجات' }
      }
    ],

    // ==========================================
    // 2. AGRICULTURAL MAP DATA
    // ==========================================
    agriculturalZones: [
      {
        id: 'pastoral',
        color: '#f39c12',
        name: {
          fr: 'Élevage extensif et parcours pastoraux',
          en: 'Extensive livestock breeding & pastoral grazing',
          ar: 'تربية الماشية في إطار الرعي الواسع'
        },
        desc: {
          fr: 'Régions arides et de haute altitude (plateau du Tibet, Mongolie-Intérieure). Élevage de yaks, moutons, chevaux et chèvres cachemire.',
          en: 'Arid and high-altitude regions (Tibetan Plateau, Inner Mongolia). Yaks, sheep, and horses.',
          ar: 'المناطق الجافة والمرتفعة (هضبة التبت، منغوليا الداخلية). تربية الياك، الأغنام، الخيول والماعز.'
        },
        coords: [
          [28.0, 85.0], [33.0, 80.0], [37.0, 76.0], [40.0, 78.0],
          [44.0, 82.0], [46.0, 90.0], [44.0, 97.0], [42.0, 105.0],
          [44.0, 114.0], [48.0, 118.0], [46.0, 120.0], [42.0, 117.0],
          [40.0, 112.0], [37.0, 105.0], [34.0, 100.0], [31.0, 98.0],
          [29.0, 92.0], [28.0, 85.0]
        ]
      },
      {
        id: 'grains',
        color: '#27ae60',
        name: {
          fr: 'Céréaliculture et cultures industrielles',
          en: 'Grain farming & industrial crops rotation',
          ar: 'زراعة الحبوب بالتناوب مع الزراعات الصناعية'
        },
        desc: {
          fr: 'Grande plaine du Nord et plaine de Mandchourie. Blé d\'hiver, maïs, soja, betterave à sucre et coton.',
          en: 'North China Plain & Manchurian Plain: winter wheat, corn, soybean, sugar beet, and cotton.',
          ar: 'السهل الصيني الشمالي وسهل منشوريا: زراعة قمح الشتاء، الذرة، الصويا، الشمندر السكري والقطن.'
        },
        coords: [
          [32.5, 113.0], [34.5, 111.0], [37.0, 113.0], [40.5, 116.0],
          [43.0, 122.0], [47.5, 124.0], [48.5, 129.0], [45.0, 131.0],
          [42.0, 127.0], [39.5, 121.0], [37.0, 120.0], [34.5, 119.0],
          [32.5, 117.0], [32.5, 113.0]
        ]
      },
      {
        id: 'tropical',
        color: '#e74c3c',
        name: {
          fr: 'Agriculture tropicale & subtropicale (riz, thé...)',
          en: 'Tropical & Subtropical crops (rice, tea, cane...)',
          ar: 'زراعة مدارية وشبه مدارية (الأرز، الشاي، قصب السكر...)'
        },
        desc: {
          fr: 'Sud et bassin du Yangtsé. Climat chaud et humide favorisant 2 à 3 récoltes de riz par an, plantations de thé, agrumes et aquaculture.',
          en: 'Warm, humid south: 2-3 rice harvests annually, extensive tea plantations, citrus, and freshwater aquaculture.',
          ar: 'الجنوب وحوض نهر يانغتسي: مناخ دافئ ورطب يتيح موسمين إلى ثلاثة للأرز سنوياً، مزارع الشاي والحمضيات وتربية الأحياء المائية.'
        },
        coords: [
          [21.5, 108.0], [24.0, 105.0], [27.0, 104.0], [30.5, 106.0],
          [32.0, 111.0], [32.0, 119.0], [30.5, 122.0], [27.0, 120.0],
          [24.0, 117.0], [22.0, 114.0], [21.0, 110.5], [19.0, 109.5],
          [19.0, 111.0], [21.5, 108.0]
        ]
      }
    ],

    // Oasis agriculture spots (Taklamakan and desert depressions)
    oasisPoints: [
      {
        name: { fr: 'Oasis de Kachgar (Xinjiang)', en: 'Kashgar Oasis (Xinjiang)', ar: 'واحة كاشغر (شينجيانغ)' },
        coords: [39.5, 75.9],
        desc: { fr: 'Irrigation millénaire des piémonts, coton à fibre longue, melons et raisins.', en: 'Historic silk road oasis: premium cotton, melons, and grapes.', ar: 'واحة تاريخية تعتمد على مياه ذوبان الجليد، زراعة القطن الممتاز والبطيخ والعنب.' }
      },
      {
        name: { fr: 'Oasis de Tourfan (Dépression)', en: 'Turpan Oasis (Depression)', ar: 'واحة تورفان' },
        coords: [42.9, 89.2],
        desc: { fr: 'Réseau traditionnel de puits artésiens (Karez), réputé pour ses raisins secs et fruits.', en: 'Famous Karez irrigation canals, grapes, raisins, and vegetables.', ar: 'شبكة قنوات الري التقليدية (الفقارات)، تشتهر بكروم العنب والتجفيف والفاكهة.' }
      },
      {
        name: { fr: 'Couloir du Hexi (Gansu)', en: 'Hexi Corridor (Gansu)', ar: 'ممر خيكسي (قانسو)' },
        coords: [39.0, 99.5],
        desc: { fr: 'Oasis irriguées le long des monts Qilian, production de céréales et maïs de semence.', en: 'Irrigated strip along Qilian Mountains: seed grains and corn.', ar: 'شريط الواحات المروية بمياه جبال تشيليان، إنتاج البذور والذرة والحبوب.' }
      },
      {
        name: { fr: 'Oasis de Hotan', en: 'Hotan Oasis', ar: 'واحة خوتان' },
        coords: [37.1, 79.9],
        desc: { fr: 'Oasis du sud du Taklamakan : sériciculture (soie), noyers et coton.', en: 'Southern Taklamakan oasis: sericulture (silk), walnuts, and cotton.', ar: 'واحة جنوب صحراء طكلاماكان: إنتاج الحرير، الجوز، والقطن.' }
      }
    ],

    // Major geographic river vectors
    rivers: [
      {
        name: { fr: 'Fleuve Jaune (Huang He)', en: 'Yellow River (Huang He)', ar: 'نهر هوانغ هو (النهر الأصفر)' },
        coords: [
          [35.0, 96.0], [35.5, 99.0], [36.2, 101.5], [36.1, 103.8],
          [37.5, 105.2], [39.5, 106.8], [40.8, 108.5], [40.5, 111.2],
          [38.5, 111.0], [35.0, 110.5], [34.8, 113.5], [35.2, 115.5],
          [37.0, 117.5], [37.8, 118.9]
        ],
        color: '#d35400'
      },
      {
        name: { fr: 'Fleuve Bleu (Yangtsé / Chang Jiang)', en: 'Yangtze River (Chang Jiang)', ar: 'نهر يانغتسي (شانغ جيانغ)' },
        coords: [
          [33.5, 93.0], [32.0, 97.0], [28.5, 99.5], [26.8, 100.5],
          [28.0, 104.5], [29.6, 106.5], [30.9, 110.5], [30.6, 114.3],
          [30.2, 116.5], [31.5, 118.5], [32.0, 119.5], [31.4, 121.5]
        ],
        color: '#2980b9'
      }
    ]
  };

  function getIndustryIcon(type) {
    var iconMap = {
      steel: { color: '#2c3e50', symbol: '●' },
      chemical: { color: '#8e44ad', symbol: '▲' },
      mechanical: { color: '#d35400', symbol: '★' },
      hightech: { color: '#2980b9', symbol: '◆' }
    };
    return iconMap[type] || { color: '#c0392b', symbol: '📍' };
  }

  // ==========================================
  // INITIALIZE INDUSTRIAL MAP
  // ==========================================
  function initIndustrialMap() {
    var container = document.getElementById('industrial-map');
    if (!container || industrialMap) return;

    industrialMap = L.map('industrial-map', {
      center: [35.0, 106.0],
      zoom: 4,
      minZoom: 3,
      maxZoom: 18,
      scrollWheelZoom: true
    });
    window.industrialMap = industrialMap;

    var baseLayers = createBaseLayers();
    baseLayers.voyager.addTo(industrialMap);

    // Layer switcher
    var currentLang = getCurrentLang();
    var layerLabels = {
      voyager: currentLang === 'ar' ? 'خريطة جوجل (Google Maps)' : (currentLang === 'en' ? 'Google Maps (Road)' : 'Carte géographique (Google)'),
      satellite: currentLang === 'ar' ? 'قمر صناعي (Satellite)' : (currentLang === 'en' ? 'Satellite Imagery' : 'Image Satellite'),
      hybrid: currentLang === 'ar' ? 'هجين (Hybrid)' : (currentLang === 'en' ? 'Hybrid (Sat + Roads)' : 'Hybride (Sat + Routes)'),
      topo: currentLang === 'ar' ? 'تضاريس (Terrain)' : (currentLang === 'en' ? 'Topography & Relief' : 'Relief Topographique')
    };

    var baseMaps = {};
    baseMaps[layerLabels.voyager] = baseLayers.voyager;
    baseMaps[layerLabels.satellite] = baseLayers.satellite;
    baseMaps[layerLabels.hybrid] = baseLayers.hybrid;
    baseMaps[layerLabels.topo] = baseLayers.topo;

    L.control.layers(baseMaps, null, { position: 'topright' }).addTo(industrialMap);

    // Add industrial polygons
    mapData.industrialRegions.forEach(function (reg) {
      var polygon = L.polygon(reg.coords, {
        color: reg.color,
        fillColor: reg.color,
        fillOpacity: 0.52,
        weight: 2
      }).addTo(industrialMap);

      polygon.bindTooltip(
        '<strong>' + reg.name[currentLang] + '</strong><br>' + reg.desc[currentLang],
        { sticky: true }
      );

      polygon.on('mouseover', function () { this.setStyle({ fillOpacity: 0.78, weight: 3 }); });
      polygon.on('mouseout', function () { this.setStyle({ fillOpacity: 0.52, weight: 2 }); });
      
      window.mapLayers.industrial[reg.id] = polygon;
    });

    // Add diversified industrial poles
    window.mapLayers.industrial['poles'] = [];
    mapData.industrialPoles.forEach(function (pole) {
      var circle = L.circle(pole.coords, {
        radius: pole.radius * 2,
        color: '#c0392b',
        fillColor: '#e74c3c',
        fillOpacity: 0.28,
        weight: 3,
        dashArray: '5, 7'
      }).addTo(industrialMap);

      circle.bindTooltip(
        '<strong>' + pole.name[currentLang] + '</strong><br>' + pole.desc[currentLang]
      );
      
      window.mapLayers.industrial['poles'].push(circle);
    });

    // Add industry points / cities
    window.mapLayers.industrial['steel'] = [];
    window.mapLayers.industrial['chemical'] = [];
    window.mapLayers.industrial['mechanical'] = [];
    window.mapLayers.industrial['hightech'] = [];
    
    mapData.industrialCities.forEach(function (city) {
      var info = getIndustryIcon(city.type);
      var customIcon = L.divIcon({
        className: 'custom-map-icon',
        html: '<div style="background-color:' + info.color + '; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:bold; box-shadow:0 2px 6px rgba(0,0,0,0.45); border:2px solid #fff;">' + info.symbol + '</div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      var marker = L.marker(city.coords, { icon: customIcon }).addTo(industrialMap);
      marker.bindPopup(
        '<div style="font-size:0.95rem; line-height:1.5;">' +
        '<strong style="color:#c0392b; font-size:1.05rem;">' + city.name[currentLang] + '</strong><br>' +
        '<span style="color:#333;">' + city.sector[currentLang] + '</span>' +
        '</div>'
      );
      
      window.mapLayers.industrial[city.type].push(marker);
    });

    // Add Legend
    industrialLegend = L.control({ position: 'bottomleft' });
    industrialLegend.onAdd = function () {
      var div = L.DomUtil.create('div', 'info legend');
      div.id = 'industrial-legend-box';
      updateIndustrialLegendContent(div, currentLang);
      return div;
    };
    industrialLegend.addTo(industrialMap);

    // Add Reset View Control button
    addResetControl(industrialMap, [35.0, 106.0], 4);
  }

  function updateIndustrialLegendContent(div, lang) {
    var t = window.translations && window.translations[lang] ? window.translations[lang] : {};
    var title = t.legendIndustrial || (lang === 'ar' ? 'المفتاح' : 'Légende');

    var html = '<h4>' + title + '</h4>';
    html += '<div class="legend-item" style="cursor:pointer;" onclick="window.highlightMapLayer(\'industrial\', \'colonial\')"><span style="background:#8e44ad; width:16px; height:16px; display:inline-block; border-radius:3px; margin-right:8px; vertical-align:middle;"></span> ' +
            (lang === 'ar' ? 'صناعات قديمة مرتبطة بالاستعمار الياباني' : (lang === 'en' ? 'Old industries (Japanese colonization)' : 'Industries liées à la colonisation japonaise')) + '</div>';
    html += '<div class="legend-item" style="cursor:pointer;" onclick="window.highlightMapLayer(\'industrial\', \'maoist\')"><span style="background:#16a085; width:16px; height:16px; display:inline-block; border-radius:3px; margin-right:8px; vertical-align:middle;"></span> ' +
            (lang === 'ar' ? 'صناعات قديمة خلال الفترة الماوية (1949-1976)' : (lang === 'en' ? 'Maoist era industries (1949-1976)' : 'Industries de l\'ère maoïste (1949-1976)')) + '</div>';
    html += '<div class="legend-item" style="cursor:pointer;" onclick="window.highlightMapLayer(\'industrial\', \'modern\')"><span style="background:#f39c12; width:16px; height:16px; display:inline-block; border-radius:3px; margin-right:8px; vertical-align:middle;"></span> ' +
            (lang === 'ar' ? 'صناعات حديثة مرتبطة بفترة الانفتاح (ZES)' : (lang === 'en' ? 'Modern opening-up zones (SEZ)' : 'Industries modernes de l\'ouverture (ZES)')) + '</div>';
    html += '<div class="legend-item" style="cursor:pointer;" onclick="window.highlightMapLayer(\'industrial\', \'poles\')"><span style="border:2px dashed #c0392b; width:16px; height:16px; display:inline-block; border-radius:50%; margin-right:8px; vertical-align:middle;"></span> ' +
            (lang === 'ar' ? 'مراكز لصناعات متنوعة كبرى' : (lang === 'en' ? 'Major diversified industry poles' : 'Pôles majeurs diversifiés')) + '</div>';
    html += '<hr style="margin:8px 0; border:0; border-top:1px solid #ddd;">';
    html += '<div style="font-size:0.82rem; color:#444; line-height:1.6;">' +
            '<span style="margin-right:8px; cursor:pointer;" onclick="window.highlightMapLayer(\'industrial\', \'steel\')" title="Click to view">● ' + (lang === 'ar' ? 'صلب' : (lang === 'en' ? 'Steel' : 'Acier')) + '</span>' +
            '<span style="margin-right:8px; cursor:pointer;" onclick="window.highlightMapLayer(\'industrial\', \'chemical\')" title="Click to view">▲ ' + (lang === 'ar' ? 'كيماويات' : (lang === 'en' ? 'Chemical' : 'Chimie')) + '</span>' +
            '<span style="margin-right:8px; cursor:pointer;" onclick="window.highlightMapLayer(\'industrial\', \'mechanical\')" title="Click to view">★ ' + (lang === 'ar' ? 'ميكانيك' : (lang === 'en' ? 'Mechanical' : 'Mécanique')) + '</span>' +
            '<span style="cursor:pointer;" onclick="window.highlightMapLayer(\'industrial\', \'hightech\')" title="Click to view">◆ ' + (lang === 'ar' ? 'تكنولوجيا' : (lang === 'en' ? 'High-Tech' : 'High-tech')) + '</span>' +
            '</div>';

    div.innerHTML = html;
  }

  // ==========================================
  // INITIALIZE AGRICULTURAL MAP
  // ==========================================
  function initAgriculturalMap() {
    var container = document.getElementById('agricultural-map');
    if (!container || agriculturalMap) return;

    agriculturalMap = L.map('agricultural-map', {
      center: [35.0, 105.0],
      zoom: 4,
      minZoom: 3,
      maxZoom: 18,
      scrollWheelZoom: true
    });
    window.agriculturalMap = agriculturalMap;

    var baseLayers = createBaseLayers();
    baseLayers.voyager.addTo(agriculturalMap);

    var currentLang = getCurrentLang();
    var layerLabels = {
      voyager: currentLang === 'ar' ? 'خريطة جوجل (Google Maps)' : (currentLang === 'en' ? 'Google Maps (Road)' : 'Carte géographique (Google)'),
      satellite: currentLang === 'ar' ? 'قمر صناعي (Satellite)' : (currentLang === 'en' ? 'Satellite Imagery' : 'Image Satellite'),
      hybrid: currentLang === 'ar' ? 'هجين (Hybrid)' : (currentLang === 'en' ? 'Hybrid (Sat + Roads)' : 'Hybride (Sat + Routes)'),
      topo: currentLang === 'ar' ? 'تضاريس (Terrain)' : (currentLang === 'en' ? 'Topography & Relief' : 'Relief Topographique')
    };

    var baseMaps = {};
    baseMaps[layerLabels.voyager] = baseLayers.voyager;
    baseMaps[layerLabels.satellite] = baseLayers.satellite;
    baseMaps[layerLabels.hybrid] = baseLayers.hybrid;
    baseMaps[layerLabels.topo] = baseLayers.topo;

    L.control.layers(baseMaps, null, { position: 'topright' }).addTo(agriculturalMap);

    // Add agricultural polygons
    mapData.agriculturalZones.forEach(function (zone) {
      var polygon = L.polygon(zone.coords, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.5,
        weight: 2
      }).addTo(agriculturalMap);

      polygon.bindTooltip(
        '<strong>' + zone.name[currentLang] + '</strong><br>' + zone.desc[currentLang],
        { sticky: true }
      );

      polygon.on('mouseover', function () { this.setStyle({ fillOpacity: 0.78, weight: 3 }); });
      polygon.on('mouseout', function () { this.setStyle({ fillOpacity: 0.5, weight: 2 }); });
      
      window.mapLayers.agricultural[zone.id] = polygon;
    });

    // Add Rivers
    window.mapLayers.agricultural['rivers'] = [];
    mapData.rivers.forEach(function (river) {
      var line = L.polyline(river.coords, {
        color: river.color,
        weight: 3.8,
        opacity: 0.9,
        smoothFactor: 1.5
      }).addTo(agriculturalMap);

      line.bindTooltip('<strong>' + river.name[currentLang] + '</strong>', { sticky: true });
      
      window.mapLayers.agricultural['rivers'].push(line);
    });

    // Add Oasis Points
    window.mapLayers.agricultural['oasis'] = [];
    mapData.oasisPoints.forEach(function (oasis) {
      var oasisIcon = L.divIcon({
        className: 'custom-oasis-icon',
        html: '<div style="background-color:#1e8449; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; box-shadow:0 2px 6px rgba(0,0,0,0.35); border:2px solid #fff;">🌴</div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      var marker = L.marker(oasis.coords, { icon: oasisIcon }).addTo(agriculturalMap);
      marker.bindPopup(
        '<div style="font-size:0.95rem; line-height:1.5;">' +
        '<strong style="color:#1e8449; font-size:1.05rem;">' + oasis.name[currentLang] + '</strong><br>' +
        '<span style="color:#333;">' + oasis.desc[currentLang] + '</span>' +
        '</div>'
      );
      
      window.mapLayers.agricultural['oasis'].push(marker);
    });

    // Add Legend
    agriculturalLegend = L.control({ position: 'bottomleft' });
    agriculturalLegend.onAdd = function () {
      var div = L.DomUtil.create('div', 'info legend');
      div.id = 'agricultural-legend-box';
      updateAgriculturalLegendContent(div, currentLang);
      return div;
    };
    agriculturalLegend.addTo(agriculturalMap);

    // Add Reset View button
    addResetControl(agriculturalMap, [35.0, 105.0], 4);
  }

  function updateAgriculturalLegendContent(div, lang) {
    var t = window.translations && window.translations[lang] ? window.translations[lang] : {};
    var title = t.legendAgricultural || (lang === 'ar' ? 'المفتاح' : 'Légende');

    var html = '<h4>' + title + '</h4>';
    html += '<div class="legend-item" style="cursor:pointer;" onclick="window.highlightMapLayer(\'agricultural\', \'pastoral\')"><span style="background:#f39c12; width:16px; height:16px; display:inline-block; border-radius:3px; margin-right:8px; vertical-align:middle;"></span> ' +
            (lang === 'ar' ? 'تربية الماشية في إطار الرعي الواسع' : (lang === 'en' ? 'Extensive pastoral & livestock grazing' : 'Élevage extensif et parcours pastoraux')) + '</div>';
    html += '<div class="legend-item" style="cursor:pointer;" onclick="window.highlightMapLayer(\'agricultural\', \'grains\')"><span style="background:#27ae60; width:16px; height:16px; display:inline-block; border-radius:3px; margin-right:8px; vertical-align:middle;"></span> ' +
            (lang === 'ar' ? 'زراعة الحبوب بالتناوب مع الزراعات الصناعية' : (lang === 'en' ? 'Grains & industrial crops rotation' : 'Céréaliculture et cultures industrielles')) + '</div>';
    html += '<div class="legend-item" style="cursor:pointer;" onclick="window.highlightMapLayer(\'agricultural\', \'tropical\')"><span style="background:#e74c3c; width:16px; height:16px; display:inline-block; border-radius:3px; margin-right:8px; vertical-align:middle;"></span> ' +
            (lang === 'ar' ? 'زراعة مدارية وشبه مدارية (الأرز، الشاي...)' : (lang === 'en' ? 'Tropical & subtropical (rice, tea...)' : 'Agriculture tropicale & subtropicale (riz, thé...)')) + '</div>';
    html += '<div class="legend-item" style="cursor:pointer;" onclick="window.highlightMapLayer(\'agricultural\', \'oasis\')"><span style="background:#1e8449; width:16px; height:16px; display:inline-block; border-radius:3px; margin-right:8px; vertical-align:middle;"></span> ' +
            (lang === 'ar' ? 'زراعة في الواحات (الصحاري الغربية)' : (lang === 'en' ? 'Oasis farming (Western deserts)' : 'Agriculture oasienne (déserts de l\'ouest)')) + '</div>';
    html += '<div class="legend-item" style="cursor:pointer;" onclick="window.highlightMapLayer(\'agricultural\', \'rivers\')"><span style="background:#2980b9; height:3px; width:16px; display:inline-block; margin-right:8px; vertical-align:middle;"></span> ' +
            (lang === 'ar' ? 'الأنهار الكبرى (يانغتسي، هوانغ هو)' : (lang === 'en' ? 'Major Rivers (Yangtze, Yellow River)' : 'Grands fleuves (Yangtsé, Huang He)')) + '</div>';

    div.innerHTML = html;
  }

  // ==========================================
  // RESET VIEW BUTTON HELPER
  // ==========================================
  function addResetControl(map, center, zoom) {
    var ResetControl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function () {
        var btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
        btn.innerHTML = '⟲';
        btn.title = 'Reset View / Réinitialiser / إعادة ضبط';
        btn.style.backgroundColor = '#fff';
        btn.style.width = '34px';
        btn.style.height = '34px';
        btn.style.lineHeight = '30px';
        btn.style.fontSize = '18px';
        btn.style.fontWeight = 'bold';
        btn.style.cursor = 'pointer';
        btn.style.color = '#333';
        btn.style.border = '2px solid rgba(0,0,0,0.2)';
        btn.style.borderRadius = '4px';
        btn.style.marginTop = '6px';

        btn.onclick = function (e) {
          e.stopPropagation();
          map.setView(center, zoom, { animate: true });
        };
        return btn;
      }
    });
    map.addControl(new ResetControl());
  }

  function getCurrentLang() {
    return document.documentElement.getAttribute('lang') || 'fr';
  }

  window.updateMapTranslations = function (lang) {
    var indDiv = document.getElementById('industrial-legend-box');
    if (indDiv) updateIndustrialLegendContent(indDiv, lang);

    var agrDiv = document.getElementById('agricultural-legend-box');
    if (agrDiv) updateAgriculturalLegendContent(agrDiv, lang);
  };

  window.initMaps = function () {
    initIndustrialMap();
    initAgriculturalMap();
  };

})();
