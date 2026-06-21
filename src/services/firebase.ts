import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { Article, Category, Subcategory, StockMovement, UserProfile, SystemConfig } from '../types';

// Configuración pública de Firebase (reemplazable por el cliente en producción)
// Declarada explícitamente como pública en el README, protegida por App Check y Rules.
export const firebaseConfig = {
  apiKey: "AIzaSyD-EjEmPlO_StOcK_SpArK_PrO_KeY_123",
  authDomain: "stockspark-pro.firebaseapp.com",
  projectId: "stockspark-pro",
  storageBucket: "stockspark-pro.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  // Clave pública de reCAPTCHA v3 para App Check
  recaptchaSiteKey: "6Lc_sample_recaptcha_site_key_123456789"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let appCheck: any = null;

export const isRealFirebaseConfigured = firebaseConfig.projectId !== "stockspark-pro" && !firebaseConfig.apiKey.includes("EjEmPlO");

if (isRealFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Habilitar persistencia offline (IndexedDB) para optimizar lecturas
    enableIndexedDbPersistence(db).catch((err) => {
      console.warn('Persistencia Offline de Firestore no disponible:', err.code);
    });

    // Inicializar Firebase App Check con reCAPTCHA v3
    if (typeof window !== 'undefined' && firebaseConfig.recaptchaSiteKey) {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(firebaseConfig.recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true
      });
    }
  } catch (error) {
    console.error('Error al inicializar Firebase:', error);
  }
}

export { app, auth, db, appCheck };

// ============================================================================
// BASE DE DATOS LOCAL MOCK / FALLBACK Y DE DEMOSTRACIÓN 
// ============================================================================

const INITIAL_USERS: UserProfile[] = [
  { id: 'usr-admin-1', nombre: 'Carlos Mendoza (Admin)', email: 'admin@negocio.com', rol: 'Admin', activo: true, mfaHabilitado: true, mfaSecret: 'JBSWY3DPEHPK3PXP' },
  { id: 'usr-operador-1', nombre: 'Lucía Torres (Operador)', email: 'operador@negocio.com', rol: 'Operador', activo: true, mfaHabilitado: false },
  { id: 'usr-operador-2', nombre: 'Miguel Ramos (Operador)', email: 'almacen@negocio.com', rol: 'Operador', activo: true, mfaHabilitado: true, mfaSecret: 'KVKVE3CVJBKU2' }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', nombre: 'Electrónica y Partes', descripcion: 'Componentes electrónicos, repuestos y accesorios tecnológicos.', orden: 1 },
  { id: 'cat-2', nombre: 'Ferretería y Herramientas', descripcion: 'Herramientas manuales, eléctricas e insumos industriales.', orden: 2 },
  { id: 'cat-3', nombre: 'Insumos de Oficina', descripcion: 'Papelería, embalaje y suministros administrativos.', orden: 3 }
];

const INITIAL_SUBCATEGORIES: Subcategory[] = [
  { id: 'sub-1', categoriaId: 'cat-1', nombre: 'Microcontroladores', descripcion: 'Placas de desarrollo y chips MCU', parentId: null, nivel: 1 },
  { id: 'sub-2', categoriaId: 'cat-1', nombre: 'Sensores y Módulos', descripcion: 'Sensores de temperatura, ultrasonido, etc.', parentId: null, nivel: 1 },
  { id: 'sub-3', categoriaId: 'cat-2', nombre: 'Herramientas Eléctricas', descripcion: 'Taladros, amoladoras, sierras', parentId: null, nivel: 1 },
  { id: 'sub-4', categoriaId: 'cat-2', nombre: 'Tornillería y Fijación', descripcion: 'Tornillos, tuercas, pernos y anclajes', parentId: null, nivel: 1 },
  { id: 'sub-5', categoriaId: 'cat-1', nombre: 'Accesorios Arduino', descripcion: 'Shields y expansiones (Nivel 2)', parentId: 'sub-1', nivel: 2 }
];

const INITIAL_ARTICLES: Article[] = [
  { id: 'art-1', sku: 'ELE-MCU-001', nombre: 'Placa de Desarrollo ESP32 Wi-Fi/BLE', descripcion: 'Módulo ESP32 Dual Core con conectividad inalámbrica para IoT.', categoriaId: 'cat-1', subcategoriaId: 'sub-1', precioCosto: 4.50, precioVenta: 12.00, stockActual: 145, stockMinimo: 20, unidadMedida: 'Unidades', proveedor: 'Espressif Systems', imagen: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=60', fechaActualizacion: new Date().toISOString() },
  { id: 'art-2', sku: 'ELE-MCU-002', nombre: 'Placa Microcontrolador UNO R3', descripcion: 'Placa compatible con ATmega328P ideal para prototipado rápido.', categoriaId: 'cat-1', subcategoriaId: 'sub-1', precioCosto: 3.20, precioVenta: 9.50, stockActual: 15, stockMinimo: 30, unidadMedida: 'Unidades', proveedor: 'Arduino Tech', imagen: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=60', fechaActualizacion: new Date().toISOString() },
  { id: 'art-3', sku: 'ELE-SEN-001', nombre: 'Sensor de Ultrasonido HC-SR04', descripcion: 'Módulo medidor de distancia por ultrasonido de 2cm a 400cm.', categoriaId: 'cat-1', subcategoriaId: 'sub-2', precioCosto: 0.85, precioVenta: 2.50, stockActual: 320, stockMinimo: 50, unidadMedida: 'Unidades', proveedor: 'SensorCorp', imagen: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&auto=format&fit=crop&q=60', fechaActualizacion: new Date().toISOString() },
  { id: 'art-4', sku: 'FER-ELC-001', nombre: 'Taladro Percutor Inalámbrico 20V', descripcion: 'Taladro industrial con batería de iones de litio y maletín.', categoriaId: 'cat-2', subcategoriaId: 'sub-3', precioCosto: 65.00, precioVenta: 135.00, stockActual: 8, stockMinimo: 10, unidadMedida: 'Unidades', proveedor: 'DeWalt Latam', imagen: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&auto=format&fit=crop&q=60', fechaActualizacion: new Date().toISOString() },
  { id: 'art-5', sku: 'FER-TOR-001', nombre: 'Caja Tornillos Madera 4x35mm (1000u)', descripcion: 'Tornillo autorroscante cabeza fresada para carpintería.', categoriaId: 'cat-2', subcategoriaId: 'sub-4', precioCosto: 12.00, precioVenta: 25.00, stockActual: 42, stockMinimo: 15, unidadMedida: 'Cajas', proveedor: 'Tornillos San Juan', imagen: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&auto=format&fit=crop&q=60', fechaActualizacion: new Date().toISOString() },
  { id: 'art-6', sku: 'OFI-PAP-001', nombre: 'Resma Papel Blanco A4 80g (500 hojas)', descripcion: 'Papel de alta blancura para impresoras láser y de inyección.', categoriaId: 'cat-3', subcategoriaId: '', precioCosto: 3.80, precioVenta: 7.50, stockActual: 180, stockMinimo: 40, unidadMedida: 'Resmas', proveedor: 'Celulosa S.A.', imagen: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=60', fechaActualizacion: new Date().toISOString() },
  { id: 'art-7', sku: 'ELE-SEN-002', nombre: 'Módulo Sensor de Temperatura DHT22', descripcion: 'Sensor digital de temperatura y humedad de alta precisión.', categoriaId: 'cat-1', subcategoriaId: 'sub-2', precioCosto: 2.10, precioVenta: 5.80, stockActual: 4, stockMinimo: 25, unidadMedida: 'Unidades', proveedor: 'MicroTech', imagen: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=400&auto=format&fit=crop&q=60', fechaActualizacion: new Date().toISOString() },
  { id: 'art-8', sku: 'FER-ELC-002', nombre: 'Amoladora Angular 115mm 750W', descripcion: 'Amoladora para corte y desbaste de metales y concreto.', categoriaId: 'cat-2', subcategoriaId: 'sub-3', precioCosto: 42.00, precioVenta: 89.00, stockActual: 14, stockMinimo: 8, unidadMedida: 'Unidades', proveedor: 'Makita Global', imagen: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&auto=format&fit=crop&q=60', fechaActualizacion: new Date().toISOString() },
  { id: 'art-9', sku: 'OFI-EMB-001', nombre: 'Cinta de Embalaje Transparente 48mm x 50m', descripcion: 'Cinta adhesiva acrílica para sellado de cajas pesadas.', categoriaId: 'cat-3', subcategoriaId: '', precioCosto: 0.90, precioVenta: 2.20, stockActual: 350, stockMinimo: 100, unidadMedida: 'Rollos', proveedor: 'Adhesivos del Sur', imagen: 'https://images.unsplash.com/photo-1595351298022-811c21a30f30?w=400&auto=format&fit=crop&q=60', fechaActualizacion: new Date().toISOString() }
];

const INITIAL_MOVEMENTS: StockMovement[] = [
  { id: 'mov-1', articuloId: 'art-1', sku: 'ELE-MCU-001', articuloNombre: 'Placa de Desarrollo ESP32 Wi-Fi/BLE', tipo: 'ENTRADA', cantidad: 50, stockAnterior: 95, stockNuevo: 145, motivo: 'Ingreso de mercancía según factura #4829', usuarioId: 'usr-admin-1', usuarioNombre: 'Carlos Mendoza (Admin)', fecha: new Date(Date.now() - 3600000 * 24 * 2).toISOString() },
  { id: 'mov-2', articuloId: 'art-2', sku: 'ELE-MCU-002', articuloNombre: 'Placa Microcontrolador UNO R3', tipo: 'SALIDA', cantidad: 20, stockAnterior: 35, stockNuevo: 15, motivo: 'Despacho a cliente corporativo #1184', usuarioId: 'usr-operador-1', usuarioNombre: 'Lucía Torres (Operador)', fecha: new Date(Date.now() - 3600000 * 24 * 1).toISOString() },
  { id: 'mov-3', articuloId: 'art-4', sku: 'FER-ELC-001', articuloNombre: 'Taladro Percutor Inalámbrico 20V', tipo: 'SALIDA', cantidad: 4, stockAnterior: 12, stockNuevo: 8, motivo: 'Venta en mostrador local', usuarioId: 'usr-operador-1', usuarioNombre: 'Lucía Torres (Operador)', fecha: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 'mov-4', articuloId: 'art-7', sku: 'ELE-SEN-002', articuloNombre: 'Módulo Sensor de Temperatura DHT22', tipo: 'SALIDA', cantidad: 25, stockAnterior: 29, stockNuevo: 4, motivo: 'Entrega para taller de robótica escolar', usuarioId: 'usr-operador-2', usuarioNombre: 'Miguel Ramos (Operador)', fecha: new Date(Date.now() - 3600000 * 2).toISOString() }
];

const INITIAL_CONFIG: SystemConfig = {
  allowedEmails: ['admin@negocio.com', 'operador@negocio.com', 'almacen@negocio.com'],
  totalArticulos: 9,
  alertasStockBajo: 3,
  valorInventario: 7914.70
};

// Almacenamiento local persistente
export const LocalDB = {
  getUsers: (): UserProfile[] => {
    const data = localStorage.getItem('stockspark_users');
    return data ? JSON.parse(data) : INITIAL_USERS;
  },
  saveUsers: (users: UserProfile[]) => {
    localStorage.setItem('stockspark_users', JSON.stringify(users));
  },
  getCategories: (): Category[] => {
    const data = localStorage.getItem('stockspark_categories');
    return data ? JSON.parse(data) : INITIAL_CATEGORIES;
  },
  saveCategories: (cats: Category[]) => {
    localStorage.setItem('stockspark_categories', JSON.stringify(cats));
  },
  getSubcategories: (): Subcategory[] => {
    const data = localStorage.getItem('stockspark_subcategories');
    return data ? JSON.parse(data) : INITIAL_SUBCATEGORIES;
  },
  saveSubcategories: (subcats: Subcategory[]) => {
    localStorage.setItem('stockspark_subcategories', JSON.stringify(subcats));
  },
  getArticles: (): Article[] => {
    const data = localStorage.getItem('stockspark_articles');
    return data ? JSON.parse(data) : INITIAL_ARTICLES;
  },
  saveArticles: (articles: Article[]) => {
    localStorage.setItem('stockspark_articles', JSON.stringify(articles));
    // Actualizar contadores calculados
    const currentConfig = LocalDB.getConfig();
    let totalArticulos = articles.length;
    let alertasStockBajo = articles.filter(a => a.stockActual <= a.stockMinimo).length;
    let valorInventario = articles.reduce((acc, a) => acc + (a.precioVenta * a.stockActual), 0);
    LocalDB.saveConfig({ ...currentConfig, totalArticulos, alertasStockBajo, valorInventario });
  },
  getMovements: (): StockMovement[] => {
    const data = localStorage.getItem('stockspark_movements');
    return data ? JSON.parse(data) : INITIAL_MOVEMENTS;
  },
  saveMovements: (movs: StockMovement[]) => {
    localStorage.setItem('stockspark_movements', JSON.stringify(movs));
  },
  getConfig: (): SystemConfig => {
    const data = localStorage.getItem('stockspark_config');
    return data ? JSON.parse(data) : INITIAL_CONFIG;
  },
  saveConfig: (cfg: SystemConfig) => {
    localStorage.setItem('stockspark_config', JSON.stringify(cfg));
  },
  init: () => {
    if (!localStorage.getItem('stockspark_config')) {
      localStorage.setItem('stockspark_users', JSON.stringify(INITIAL_USERS));
      localStorage.setItem('stockspark_categories', JSON.stringify(INITIAL_CATEGORIES));
      localStorage.setItem('stockspark_subcategories', JSON.stringify(INITIAL_SUBCATEGORIES));
      localStorage.setItem('stockspark_articles', JSON.stringify(INITIAL_ARTICLES));
      localStorage.setItem('stockspark_movements', JSON.stringify(INITIAL_MOVEMENTS));
      localStorage.setItem('stockspark_config', JSON.stringify(INITIAL_CONFIG));
    }
  }
};

// Inicializar la base de datos local
LocalDB.init();
