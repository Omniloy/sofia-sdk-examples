(function() {
  window.Template = {
    title: 'create_clinical_notes',
    description:
      "Generates clinical notes, possible diagnosis, treatments, reason for consultation, current illness, physical examination, comments and observations, treatment plan mentioned in the consultation transcript.",
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
      reason_for_consultation: {
        type: 'string',
        description:
          'Reason for consultation mentioned during the visit.',
      },
      summary: {
        type: 'string',
        description:
          'Summary of the consultation.',
      },
      present_illness: {
        type: 'string',
        description:
          'Current illness or condition discussed during the visit.',
      },
      comments_observations: {
        type: 'string',
        description:
          'Comments and observations from the consultation.',
      },
      treatment_plan: {
        type: 'string',
        description:
          'Treatment plan discussed during the consultation.',
      },
      vital_signs: {
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
                'Systolic Blood Pressure (mmHg)',
                'Diastolic Blood Pressure (mmHg)',
                'Pulse (bpm)',
                'O2 Saturation (%)',
                'Temperature (C)',
                'Pain (scale)',
                'Respiratory Rate (rpm)',
                'Weight (Kg)',
                'Height (cm)',
                'Blood Glucose (mg/dl)',
              ],
            },
            value: {
              type: 'string',
              description: 'The value of the vital sign.',
            },
          },
        },
      },
      allergies: {
        type: 'object',
        properties: {
          allergies: {
            type: 'array',
            description: 'List of patient allergies.',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: 'Type of allergy.',
                },
                specific_type: {
                  type: 'string',
                  description: 'Specific allergy type.',
                },
                subtype: {
                  type: 'string',
                  description: 'Allergy subtype.',
                },
                observations: {
                  type: 'string',
                  description: 'Observations about the allergy.',
                },
              },
            },
          },
          intolerances: {
            type: 'array',
            description: 'List of patient intolerances.',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: 'Type of intolerance.',
                },
                observations: {
                  type: 'string',
                  description: 'Observations about the intolerance.',
                },
              },
            },
          },
        },
      },
      personal_history: {
        type: 'object',
        properties: {
          diseases: {
            type: 'array',
            description:
              'List of diseases mentioned by the user and their observations.',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the disease.',
                  source: 'ICD10',
                },
                observations: {
                  type: 'string',
                  description:
                    'Additional observations about the mentioned disease.',
                },
              },
            },
          },
        },
      },
      family_history: {
        type: 'object',
        properties: {
          family_diseases: {
            type: 'array',
            description: 'Family disease history.',
            items: {
              type: 'object',
              properties: {
                relationship: {
                  type: 'string',
                  enum: [
                    'Mother',
                    'Father',
                    'Brother',
                    'Sister',
                    'Grandmother',
                    'Grandfather',
                    'Great-grandmother',
                    'Great-grandfather',
                    'Aunt',
                    'Uncle',
                    'Granddaughter',
                    'Grandson',
                    'Niece',
                    'Nephew',
                    'Other',
                  ],
                },
                name: {
                  type: 'string',
                  description: 'Name of the disease.',
                  source: 'ICD10',
                },
              },
            },
          },
        },
      },
      diagnosis: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description:
                'Diagnosis code using ICD-10, being as specific as possible with the information provided.',
            },
            name: {
              type: 'string',
              description: 'Name of the disease.',
              source: 'ICD10',
            },
            description: {
              type: 'string',
              description: 'Justification or description of the diagnosis.',
            },
          },
          required: ['code', 'name', 'description'],
        },
        description:
          'List the diagnosis(es) determined during this medical consultation, including name, description (justification) and ICD-10 code, if applicable. If no diagnosis is specified, suggest the most likely possibilities based on the conversation. Do not include previous diagnoses recorded in the personal history.',
        model: 'diagnostico',
      },
      clinical_notes: {
        type: 'string',
        description:
          'Clinical notes from the consultation.',
      },
    },
  };
})();
