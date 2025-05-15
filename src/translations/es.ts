
const translations: Record<string, string> = {
  // Posted date format
  posted: 'Publicado',
  // General pages
  dashboard: 'Panel de Control',
  members: 'Miembros',
  membershipPlans: 'Planes de Membresía',
  membershipPlansTitle: 'Planes de Membresía',
  membershipPlansDescription:
    'Administra los planes de membresía de tu gimnasio',
  plan: 'Plan',
  classes: 'Clases',
  trainers: 'Entrenadores',
  equipment: 'Equipamiento',
  reports: 'Informes',
  announcements: 'Anuncios',
  payments: 'Pagos',

  // Common actions
  save: 'Guardar',
  cancel: 'Cancelar',
  add: 'Añadir',
  edit: 'Editar',
  delete: 'Eliminar',
  confirm: 'Confirmar',
  view: 'Ver',
  search: 'Buscar',
  filter: 'Filtrar',
  back: 'Volver',
  close: 'Cerrar',

  // Navigation
  home: 'Inicio',
  login: 'Iniciar Sesión',

  // Status and labels
  statusActive: 'Activo',
  statusInactive: 'Inactivo',
  statusPending: 'Pendiente',
  statusExpired: 'Expirado',
  statusCancelled: 'Cancelado',
  statusVerified: 'Verificado',
  statusRejected: 'Rechazado',
  'statusAbout-expire': 'Por vencer',
  // Payments page
  paymentsTitle: 'Gestión de Pagos',
  paymentsDescription:
    'Ver y gestionar los pagos de los miembros del gimnasio.',
  allPayments: 'Todos los pagos',
  pendingPayments: 'Pagos pendientes',
  allPaymentsTitle: 'Todos los Pagos',
  allPaymentsDescription:
    'Lista completa de todos los pagos realizados por los miembros.',
  pendingPaymentsTitle: 'Pagos Pendientes de Verificación',
  pendingPaymentsDescription: 'Lista de pagos que requieren verificación.',
  paymentsTableCaption: 'Lista completa de todos los pagos realizados.',
  pendingPaymentsTableCaption: 'Lista de pagos pendientes de verificación.',
  noPaymentsFound: 'No se encontraron pagos.',
  noPendingPaymentsFound: 'No hay pagos pendientes para verificar.',
  addPayment: 'Añadir Pago',
  createNewPayment: 'Crear Nuevo Pago',
  createNewPaymentDescription:
    'Ingrese los detalles del pago para registrarlo en el sistema.',

  // Payment form fields validation messages
  selectMemberRequired: 'Por favor seleccione un miembro',
  selectPlanRequired: 'Por favor seleccione un plan',
  amountRequired: 'Por favor ingrese un monto',
  paymentMethodRequired: 'Por favor seleccione un método de pago',
  dateRequired: 'Por favor seleccione una fecha',

  // Form placeholders
  selectMemberPlaceholder: 'Seleccione un miembro',
  selectPlanPlaceholder: 'Seleccione un plan',
  amountPlaceholder: '0.00',
  selectMethodPlaceholder: 'Seleccione un método',
  selectStatusPlaceholder: 'Seleccione un estado',
  notesPlaceholder: 'Añadir notas o detalles adicionales sobre este pago',

  // Payment methods
  cash: 'Efectivo',
  card: 'Tarjeta',
  yape: 'Yape',
  plin: 'Plin',
  transfer: 'Transferencia',
  paymentMethodCash: 'Efectivo',
  paymentMethodCard: 'Tarjeta',
  paymentMethodYape: 'Yape',
  paymentMethodPlin: 'Plin',
  paymentMethodTransfer: 'Transferencia',

  // Payment fields
  member: 'Miembro',
  membershipPlan: 'Plan de Membresía',
  amount: 'Monto',
  paymentMethod: 'Método de Pago',
  paymentDate: 'Fecha de Pago',
  status: 'Estado',
  notes: 'Notas',
  notesOptional: 'Notas (Opcional)',
  actions: 'Acciones',

  // Payment details
  paymentDetails: 'Detalles del Pago',
  paymentDetailsDescription: 'Información detallada sobre el pago.',
  paymentReceipt: 'Comprobante de Pago',
  viewDetails: 'Ver Detalles',

  // Payment verification
  verifyPayment: 'Verificar Pago',
  verify: 'Verificar',
  reject: 'Rechazar',
  rejectPayment: 'Rechazar Pago',
  rejectPaymentDescription:
    'Por favor, proporcione un motivo para rechazar este pago.',
  confirmReject: 'Confirmar Rechazo',
  rejectionReason: 'Motivo del Rechazo',
  rejectionReasonPlaceholder: 'Explique por qué se rechaza este pago...',

  // Success and error messages
  paymentVerifiedTitle: 'Pago Verificado',
  paymentVerifiedMessage: 'El pago ha sido verificado con éxito.',
  paymentVerifyErrorTitle: 'Error de Verificación',
  paymentRejectedTitle: 'Pago Rechazado',
  paymentRejectedMessage: 'El pago ha sido rechazado con éxito.',
  paymentRejectErrorTitle: 'Error de Rechazo',
  validationError: 'Error de Validación',
  pleaseProvideRejectionReason:
    'Por favor, proporcione un motivo para el rechazo.',

  // Membership plans page
  planDetails: 'Detalles del Plan',
  features: 'Características:',
  noFeaturesListed: 'No hay características listadas',
  addNewMembershipPlan: 'Añadir Nuevo Plan de Membresía',
  editMembershipPlan: 'Editar Plan de Membresía',
  deletePlanConfirmation:
    'Esto eliminará permanentemente el plan de membresía "{name}". Esta acción no se puede deshacer.',
  noPlansFound:
    'No se encontraron planes de membresía. Haz clic en "Añadir Plan" para crear tu primer plan.',
  monthly: 'Mensual',
  annual: 'Anual',
  month: 'mes',
  year: 'año',
  mostPopular: 'Más Popular',
  bestValue: 'Mejor Valor',
  selectPlan: 'Seleccionar Plan',

  // App information
  appName: 'GymPro',
  footerDescription:
    'Plataforma profesional de gestión de gimnasios. Simplificando operaciones y mejorando la experiencia de los miembros.',
  resources: 'Recursos',
  legal: 'Legal',
  contact: 'Contacto',
  privacy: 'Política de Privacidad',
  terms: 'Términos de Servicio',
  allRightsReserved: 'Todos los derechos reservados',

  // Dashboard
  dashboardDescription:
    'Resumen de estadísticas del gimnasio y actividades recientes.',
  activeMembers: 'Miembros Activos',
  classesToday: 'Clases de Hoy',
  monthlyRevenue: 'Ingresos Mensuales',
  newSignups: 'Nuevos Miembros',
  recentActivity: 'Actividad Reciente',
  viewAll: 'Ver Todo',
  noActivitiesToDisplay: 'No hay actividades para mostrar.',
  noAnnouncementsToDisplay: 'No hay anuncios para mostrar.',
  recentMembers: 'Miembros Recientes',
  searchMembers: 'Buscar miembros...',
  todaysClasses: 'Clases de Hoy',
  viewFullSchedule: 'Ver Calendario Completo',
  name: 'Nombre',
  membership: 'Membresía',
  joinDate: 'Fecha de Ingreso',
  time: 'Hora',
  trainer: 'Entrenador',
  room: 'Sala',
  capacity: 'Capacidad',
  classFull: 'Lleno',
  classOpen: 'Disponible',
  addMember: 'Añadir Miembro',
  editMember: 'Editar Miembro',

  addNewMember: 'Añadir Nuevo Miembro',
  membersDescription: 'Administra los miembros de tu gimnasio',
  unknown: 'Desconocido',
  areYouSure: '¿Estás seguro?',
  deleteConfirmationDescription:
    'Esta acción eliminará permanentemente el registro de {name} y todos los datos asociados. Esta acción no se puede deshacer.',
  memberDeleted: 'Miembro eliminado',
  memberDeletedDescription: 'El miembro ha sido eliminado correctamente',
  failedToDeleteMember: 'Error al eliminar el miembro',
  planDeleted: 'Plan eliminado',
  planDeletedDescription:
    'El plan de membresía ha sido eliminado correctamente',
  failedToDeletePlan: 'Error al eliminar el plan de membresía',

  // Payment Dialog
  subscribeToMembership: 'Suscribirse a Membresía',
  fullName: 'Nombre Completo',
  email: 'Correo Electrónico',
  phone: 'Teléfono',
  continueToPay: 'Continuar a Pago',
  payWithYape: 'Pagar con Yape',
  yapePaymentDescription:
    'Escanea el código QR a continuación o envía el pago a nuestro número de Yape.',
  orYapeTo: 'O envía Yape a',
  uploadPaymentProof: 'Subir Comprobante de Pago',
  dragAndDropOrClick: 'Arrastra y suelta o haz clic para subir',
  selectFile: 'Seleccionar Archivo',
  confirmPayment: 'Confirmar Pago',
  processing: 'Procesando...',

  // File upload related
  error: 'Error',
  success: 'Éxito',
  fileTooLarge: 'El archivo es demasiado grande. El tamaño máximo es 5MB.',
  fileTypeNotSupported:
    'Tipo de archivo no soportado. Por favor, sube una imagen.',
  fileUploadError: 'Error al subir el archivo. Por favor, inténtalo de nuevo.',
  fileUploadSuccess: '¡Archivo subido con éxito!',
  missingUploadedReceipt:
    'Por favor, sube una imagen del comprobante antes de confirmar.',

  // Payment Success
  paymentReceived: 'Pago Recibido',
  paymentSuccessDescription: 'Hemos recibido tu información de pago.',
  paymentSuccessMessage:
    'Nuestro equipo verificará tu pago en breve. Una vez verificado, tu membresía será activada.',
  yourPendingPayments: 'Tus Pagos Pendientes',
  pendingVerification: 'Pendiente de Verificación',
  paymentVerificationNote:
    'La verificación del pago normalmente toma 1-2 días hábiles.',
  backToHome: 'Volver al Inicio',
  checkPaymentStatus: 'Verificar Estado del Pago',

  // Payment Creation
  paymentCreated: 'Pago Creado',
  paymentCreatedDescription: 'Tu pago ha sido enviado para verificación.',
  paymentCreationError:
    'Hubo un error al crear el pago. Por favor, inténtalo de nuevo.',
  paymentProcessingError:
    'Error al procesar el pago. Por favor, inténtalo más tarde.',
  createPayment: 'Crear Pago',

  // Payment Status
  paymentStatusDescription: 'Rastrea el estado de tus pagos recientes.',
  pending: 'Pendiente',
  verified: 'Verificado',
  rejected: 'Rechazado',
  paymentStatusPending: 'Pendiente',
  paymentStatusVerified: 'Verificado',
  paymentStatusRejected: 'Rechazado',

  //more translations...
  noPhoneProvided: 'No se proporcionó número de teléfono',
  noAddressProvided: 'No se proporcionó dirección',
  joinedOn: 'Se unió en',
  expiresOn: 'Expira en',
  backToMembers: 'Volver a Miembros',
  totalPayments: 'Total de Pagos',
  attendanceRate: 'Tasa de Asistencia',
  firstName: 'Nombre',
  lastName: 'Apellido',
  address: 'Dirección',
  emergencyContact: 'Contacto de Emergencia',
  emergencyPhone: 'Teléfono de Emergencia',
  active: 'Activo',
  expired: 'Expirado',
  paymentHistory: 'Historial de Pagos',
  classHistory: 'Historial de Clases',
  allClasses: 'Todas las Clases',
  noClassBookingsYet: 'No hay reservas de clases aún.',
  activityLog: 'Registro de Actividades',
  allActivities: 'Todas las Actividades',
  booking: 'Reservar clases',
  class: 'Clases',
  bookingDate: 'Fecha de Reserva',
  addBooking: 'Añadir Reserva',
  attendance: 'Asistencia',
  date: 'Fecha',
  attended: 'Asistió',
  overview: 'Resumen',
  activity: 'Actividad',
  planName: 'Nombre del Plan',
  duration: 'Duración',
  durationType: 'Tipo de Duración',
  description: 'Descripción',
  planFeatures: 'Características del Plan',
  activeStatus: 'Estado Activo',
  price: 'Precio',
  classSchedule: 'Horario de Clases',
  addClass: 'Añadir Clase',
  todayClasses: 'Clases de Hoy',
  className: 'Nombre de la Clase',
  startTime: 'Hora de Inicio',
  endTime: 'Hora de Fin',
  daysOfTheWeek: 'Días de la Semana',
  days: 'Días',
}

export default translations
