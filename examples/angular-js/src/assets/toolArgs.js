(function() {
  window.ToolArgs = {
      title: "create_clinical_notes",
      target_language: "English",
      description: "Generate clinical notes, possible diagnosis, treatment packs, reason for consultation, current illness, physical examination, comments and observations, and treatment plan from the user's conversation.",
      type: "object",
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
        diagnosis: {
          type: "array",
          model: "diagnosis",
          description: "Generates the patient's diagnosis based on clinical notes.",
          items: {
            type: "object",
            properties: {
              code: {
                type: "string",
                description: "Diagnosis code."
              },
              description: {
                type: "string",
                description: "Diagnosis description."
              }
            }
          }
        },
        procedures: {
          type: "array",
          description: "Generates patient procedures based on clinical notes.",
          items: {
            type: "object",
            properties: {
              "code": {
                type: "string",
                description: "Procedure code."
              },
              description: {
                type: "string",
                description: "Description of the procedure."
              }
            }
          },
          source: "procedures",
          search_fields: [
            "description"
          ]
        },
        chief_complaints: {
          type: "string",
          description: "In a few lines, explain the main reason for the visit and the initial symptoms. Be precise and avoid redundancies. Use medical terminology."
        },
        medical_history: {
          type: "array",
          description: "Generates the patient's medical history based on clinical notes.",
          items: {
            type: "object",
            properties: {
              "code": {
                type: "string",
                description: "Code of the present disease."
              },
              description: {
                type: "string",
                description: "Description of the present disease."
              }
            }
          }
        },
        family_history: {
          type: "array",
          description: "Generates the patient's family history based on clinical notes.",
          items: {
            type: "object",
            properties: {
              "code": {
                type: "string",
                description: "Code of the present disease."
              },
              description: {
                type: "string",
                description: "Description of the present disease."
              },
              duration_in_years: {
                type: "number",
                description: "Duration of the disease in years."
              },
              duration_in_months: {
                type: "number",
                description: "Duration of illness in months."
              },
              duration_in_days: {
                type: "number",
                description: "Duration of illness in days."
              }
            }
          }
        },
        present_illness: {
          type: "string",
          description: "Generates the patient's current diseases based on clinical notes."
        },
        doctor_recommendation: {
          type: "string",
          description: "Generates doctor's recommendations based on clinical notes.",
          reference: 'CIE10',
        }
      }
};
})();
