#!/usr/bin/env python3

# Read the seed file
with open('/home/z/my-project/prisma/seed.ts', 'r') as f:
    content = f.read()

# Fix medicalHistory section - replace upsert with create
old_medical_history = '''    // Add some medical history
    await prisma.medicalHistory.upsert({
      where: {
        patientId_condition: {
          patientId: patient.user,
          condition: patientData.medicalConditions,
        },
      },
      update: {},
      create: {
        patientId: patient.user,
        type: "GENERAL",
        condition: patientData.medicalConditions,
        diagnosisDate: new Date("2024-01-01"),
        description: `Patient has ${patientData.medicalConditions.toLowerCase()} requiring physiotherapy treatment.`,
        isChronic: true,
        notes: `Allergies: ${patientData.allergies}. Medications: ${patientData.medications}`,
      },
    });'''

new_medical_history = '''    // Add medical history
    await prisma.medicalHistory.create({
      data: {
        userId: user.id,
        title: patientData.medicalConditions,
        description: `Patient has ${patientData.medicalConditions.toLowerCase()} requiring physiotherapy treatment. Allergies: ${patientData.allergies}. Medications: ${patientData.medications}`,
      },
    });'''

# Fix consent form section - replace upsert with create
old_consent_form = '''    // Add consent form
    await prisma.consentForm.upsert({
      where: {
        patientId_formType: {
          patientId: patient.user,
          formType: "GENERAL_TREATMENT",
        },
      },
      update: {},
      create: {
        patientId: patient.user,
        formType: "GENERAL_TREATMENT",
        consentDate: new Date("2024-01-15"),
        isSigned: true,
        signature: `${patientData.name} - Electronically signed`,
      },
    });'''

new_consent_form = '''    // Add consent form
    await prisma.consentForm.create({
      data: {
        userId: user.id,
        formName: "General Treatment Consent",
        formContent: `I consent to receive physiotherapy treatment and understand the procedures involved. I understand that I can withdraw consent at any time.`,
        signedAt: new Date("2024-01-15"),
      },
    });'''

# Replace the content
content = content.replace(old_medical_history, new_medical_history)
content = content.replace(old_consent_form, new_consent_form)

# Write back the file
with open('/home/z/my-project/prisma/seed.ts', 'w') as f:
    f.write(content)

print("✅ Fixed seed script")
