export const ToolArgs = {
  title: 'create_clinical_notes',
  description:
    "Generates clinical note, possible diagnosis, treatments, reason for consultation, current illness, physical examination, comments and observations, treatment plan mentioned in the consultation transcript.",
  type: 'object',
  properties: {
    current_day: {
      type: 'string',
      description:
        'Returns date, including hours and minutes of the current date',
      required: ['current_day'],
    },
    next_date: {
      type: 'string',
      description:
        "Returns the date, including hours and minutes, of the next appointment discussed with the doctor. If it is mentioned, don't make it up.",
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
  },
};