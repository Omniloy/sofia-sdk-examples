import type { AppConfig, PatientData } from '../types';

export const DEFAULT_CONFIG: AppConfig = {
  patientId: '12ahte3asad45',
  userId: 'user1aasddddd23',
  baseUrl: import.meta.env.VITE_BASE_URL,
  wssUrl: import.meta.env.VITE_WSS_URL,
  apiKey: import.meta.env.VITE_API_KEY,
  isOpen: true
};

export const DEFAULT_PATIENT_DATA: PatientData = {
  extraData: { 
    clinical_notes: 'es celiaco y diabético',  
    alergias: "al polen",
    medicamentos: "metformina, insulina"
  },
  fullName: 'Juan Pérez García',
  birthDate: '01/15/1980',
  phone: '+34 555-123-4567',
  address: 'Calle Mayor 123, 28001 Madrid, España'
};

export const TOOLS_CONFIG = {
  title: 'create_clinical_notes',
  description:
    "Genera nota clinica, posible diacnostico, tratamientos, motivo de consulta, enfermedad actual, exploracion fisica, comentarios observaciones, plan de tratamiento mencionado en la transcripcion de la consulta.",
  type: 'object',
  properties: {
      dia_actual: {
      type: 'string',
      description:
        'Devuelve fecha, incluyendo horas y minutos de la fecha actual',
      required: ['dia_actual'],
    },
    proxima_cita: {
      type: 'string',
      description:
        'Devuelve fecha, incluyendo horas y minutos de la próxima cita discutida con el doctor. Si es que se menciona, sino no inventes',
    },
    motivo_de_consulta: {
      type: 'string',
      description:
        'Estas son las MOTIVO DE CONSULTA actuales: . No cambies la estructura o la informacion existente en tu respuesta',
    },
    resumen: {
      type: 'string',
      description:
        'Estas son las RESUMEN actuales: . No cambies la estructura o la informacion existente en tu respuesta',
    },
    enfermedad_actual: {
      type: 'string',
      description:
        'Estas son las ENFERMEDAD ACTUAL actuales: . No cambies la estructura o la informacion existente en tu respuesta',
    },
    comentarios_observaciones: {
      type: 'string',
      description:
        'Estas son las COMENTARIOS / OBSERVACIONES actuales: . No cambies la estructura o la informacion existente en tu respuesta',
    },
    plan_de_tratamientos: {
      type: 'string',
      description:
        'Estas son las PLAN DE TRATAMIENTOS actuales: . No cambies la estructura o la informacion existente en tu respuesta',
    },
    peticiones: {
      type: 'string',
      description:
        'Estas son las PETICIONES actuales: . No cambies la estructura o la informacion existente en tu respuesta',
    },
    constantes_vitales: {
      type: 'array',
      description:
        "A list of vital signs, each including a predefined name and its corresponding value. If reading the blood pressure is mentioned as '120 80,' do not interpret it as a decimal number (120.80). Always treat it as two separate values: the systolic (first number) and diastolic (second number).",
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the vital sign.',
            enum: [
              'Tensión Arterial Sistólica (mmHg)',
              'Tensión Arterial Diastólica (mmHg)',
              'Pulso (ppm)',
              'Saturación O₂ (%)',
              'Temperatura (ºC)',
              'Dolor (Ud)',
              'Frecuencia Respiratoria (rpm)',
              'Peso (Kg)',
              'Talla (cm)',
              'Glucemia (mg/dl)',
            ],
          },
          value: {
            type: 'string',
            description: 'The value of the vital sign.',
          },
        },
      },
    },
    alergias: {
      type: 'object',
      properties: {
        allergies: {
          type: 'array',
          description: 'Lista de alergias del paciente.',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                description: 'Tipo de alergia.',
              },
              specific_type: {
                type: 'string',
                description: 'Tipo específico de alergia.',
              },
              subtype: {
                type: 'string',
                description: 'Subtipo de la alergia.',
              },
              observaciones: {
                type: 'string',
                description: 'Observaciones sobre la alergia.',
              },
            },
          },
        },
        intolerances: {
          type: 'array',
          description: 'Lista de intolerancias del paciente.',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                description: 'Tipo de intolerancia.',
              },
              observaciones: {
                type: 'string',
                description: 'Observaciones sobre la intolerancia.',
              },
            },
          },
        },
      },
    },
    socioeconomico: {
      type: 'string',
      description:
        'Estas son las Socioeconomico actuales: . No cambies la estructura o la informacion existente en tu respuesta',
    },
    antecedentes_personales: {
      type: 'object',
      properties: {
        enfermedades: {
          type: 'array',
          description:
            'Lista de enfermedades mencionadas por el usuario y sus observaciones.',
          items: {
            type: 'object',
            properties: {
              nombre: {
                type: 'string',
                description: 'Nombre de la enfermedad.',
                reference: 'CIE10',
              },
              observaciones: {
                type: 'string',
                description:
                  'Observaciones adicionales sobre la enfermedad mencionada.',
              },
            },
          },
        },
      },
    },
    antecedentes_familiares: {
      type: 'object',
      properties: {
        historia_familiar: {
          type: 'array',
          description: 'Historial de enfermedades en la familia.',
          items: {
            type: 'object',
            properties: {
              parentesco: {
                type: 'string',
                enum: [
                  'Madre',
                  'Padre',
                  'Hermano',
                  'Hermana',
                  'Abuela',
                  'Abuelo',
                  'Bisabuela',
                  'Bisabuelo',
                  'Tía',
                  'Tío',
                  'Nieta',
                  'Nieto',
                  'Sobrina',
                  'Sobrino',
                  'Otro',
                ],
              },
              nombre: {
                type: 'string',
                description: 'Nombre de la enfermedad.',
                reference: 'CIE10',
              },
            },
          },
        },
      },
    },
    diagnostico: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description:
              'Código de diagnóstico utilizando el CIE10 y siendo lo más específico posible con la información proporcionada.',
          },
          nombre: {
            type: 'string',
            description: 'Nombre de la enfermedad.',
            reference: 'CIE10',
          },
          description: {
            type: 'string',
            description: 'Justificación o descripción del diagnóstico.',
          },
        },
        required: ['code', 'nombre', 'description'],
      },
      description:
        'Enumere el/los diagnóstico(s) determinado(s) durante esta consulta médica, incluyendo nombre, descripción (justificación) y código CIE10, si corresponde. Si no se especifica ningún diagnóstico, sugiera las posibilidades más probables según la conversación. No incluya diagnósticos previos registrados en su historial personal.',
      model: 'diagnostico',
    },
    clinical_notes: {
      type: 'string',
      description:
        'Estas son las clinical notes actuales: . No cambies la estructura o la informacion existente en tu respuesta',
    },
  },
};
