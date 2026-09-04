export interface TortQuestion {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'textarea' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
  categoryBadge?: string;
}

export interface TortQuestionsMap {
  [tortType: string]: TortQuestion[];
}

export const DEFAULT_TORT_QUESTIONS: TortQuestionsMap = {
  'PFAS': [
    { id: 'pfas-1', name: 'pfasFacility', label: 'Military Base or Municipal Water Supply Source Name:', type: 'text', required: true, placeholder: 'e.g. Pease Air Force Base / Local Water Utility', categoryBadge: 'Exposure Source' },
    { id: 'pfas-2', name: 'pfasExposureYears', label: 'Duration of Exposure to PFAS Contaminated Water (Years):', type: 'select', required: true, options: ['1-2 Years', '3-5 Years', '5-10 Years', '10+ Years'], categoryBadge: 'Exposure Window' },
    { id: 'pfas-3', name: 'pfasDiagnosis', label: 'Diagnosed Medical Condition:', type: 'select', required: true, options: ['Kidney Cancer / Renal Carcinoma', 'Testicular Cancer', 'Thyroid Disease / Thyroid Cancer', 'Prostate Cancer', 'Ulcerative Colitis', 'Other Cancer'], categoryBadge: 'Diagnosis' },
    { id: 'pfas-4', name: 'pfasDiagnosisDate', label: 'Date of Diagnosis:', type: 'date', required: true, categoryBadge: 'Diagnosis Date' },
    { id: 'pfas-5', name: 'pfasHospital', label: 'Hospital / Clinic where Diagnosis was Confirmed:', type: 'text', required: false, placeholder: 'Facility Name', categoryBadge: 'Medical Verification' },
    { id: 'pfas-6', name: 'pfasMedicalRecords', label: 'Are Medical Records Currently Available?', type: 'select', required: false, options: ['Yes', 'No'], categoryBadge: 'Records Status' }
  ],

  'Rideshare': [
    { id: 'rs-1', name: 'rideshareAssaulted', label: 'Were you Physically Assaulted (sexual in nature) while in a Rideshare?', type: 'select', required: true, options: ['Yes', 'No'], categoryBadge: 'Incident Type' },
    { id: 'rs-2', name: 'rideshareProvider', label: 'Did this incident happen in a LYFT or UBER?', type: 'select', required: true, options: ['Uber', 'Lyft', 'Other'], categoryBadge: 'Provider' },
    { id: 'rs-3', name: 'rideshareIncidentDate', label: 'Date of Incident:', type: 'date', required: true, categoryBadge: 'Incident Date' },
    { id: 'rs-4', name: 'rideshareProofOfRide', label: 'Do you have proof of ride (receipt, app screenshot)?', type: 'select', required: false, options: ['Yes', 'No'], categoryBadge: 'Verification' },
    { id: 'rs-5', name: 'rideshareDriverName', label: 'Driver Name / Vehicle Details:', type: 'text', required: false, placeholder: 'Driver Name or License Plate', categoryBadge: 'Driver Info' },
    { id: 'rs-6', name: 'rideshareIncidentAddress', label: 'Address where incident occurred:', type: 'text', required: false, placeholder: 'City, State, Location', categoryBadge: 'Location' },
    { id: 'rs-7', name: 'rideshareNarrative', label: 'Can you describe the incident in detail?', type: 'textarea', required: false, placeholder: 'Describe what happened during the incident...', categoryBadge: 'Narrative' },
    { id: 'rs-8', name: 'rideshareReportedTo', label: 'Did you report this incident to anyone?', type: 'select', required: false, options: ['Police', 'Parents', 'Rideshare App Support', 'Friends/Relatives', 'No One'], categoryBadge: 'Reporting' },
    { id: 'rs-9', name: 'legalRepresentation', label: 'Do you have existing legal representation for this claim?', type: 'select', required: false, options: ['Yes', 'No'], categoryBadge: 'Legal Status' }
  ],

  'Roblox': [
    { id: 'rbx-1', name: 'robloxClaimFor', label: 'Is this claim for you or someone else?', type: 'select', required: true, options: ['Myself', 'Loved One/Family Member'], categoryBadge: 'Claimant Type' },
    { id: 'rbx-2', name: 'robloxApplyingFor', label: 'Who are you applying for? (If for someone else):', type: 'text', required: false, placeholder: 'e.g. My Son / Daughter / Grandchild', categoryBadge: 'Claimant Info' },
    { id: 'rbx-3', name: 'robloxVictimAge', label: 'How old was your Son/Daughter/Victim when this happened?', type: 'text', required: true, placeholder: 'e.g. 12 years old', categoryBadge: 'Victim Age' },
    { id: 'rbx-4', name: 'robloxStartUsingDate', label: 'When did you first start using Roblox?', type: 'date', required: true, categoryBadge: 'Timeline' },
    { id: 'rbx-5', name: 'robloxIncidentDate', label: 'When did this incident happen?', type: 'date', required: true, categoryBadge: 'Timeline' },
    { id: 'rbx-6', name: 'robloxDailyTime', label: 'How much time did Victim spend on Roblox daily?', type: 'text', required: false, placeholder: 'e.g. 3-4 hours daily', categoryBadge: 'Usage Time' },
    { id: 'rbx-7', name: 'robloxVictimGamertag', label: 'Roblox Username of Son/Daughter/Victim:', type: 'text', required: true, placeholder: 'Victim Roblox Username', categoryBadge: 'Account Info' },
    { id: 'rbx-8', name: 'robloxAbuserGamertag', label: "Abuser's Username on Roblox:", type: 'text', required: false, placeholder: 'Abuser Roblox Username', categoryBadge: 'Abuser Info' },
    { id: 'rbx-9', name: 'robloxExternalPlatform', label: 'Did Victim communicate with abuser outside Roblox? (Select platform):', type: 'select', required: false, options: ['Snapchat', 'Discord', 'Instagram', 'Other', 'No External Communication'], categoryBadge: 'External Platform' },
    { id: 'rbx-10', name: 'robloxVictimExternalUsername', label: "What was Victim's Username on Snapchat/Instagram/Discord/Other?", type: 'text', required: false, placeholder: 'Victim External Username', categoryBadge: 'External Username' },
    { id: 'rbx-11', name: 'robloxAbuserExternalUsername', label: "What was Abuser's Username on Snapchat/Instagram/Discord/Other?", type: 'text', required: false, placeholder: 'Abuser External Username', categoryBadge: 'External Username' },
    { id: 'rbx-12', name: 'robloxIncidentNarrative', label: 'Explain in detail what your Son/Daughter/Victim went through:', type: 'textarea', required: true, placeholder: 'Describe grooming, communications, or incident in detail...', categoryBadge: 'Narrative' },
    { id: 'rbx-13', name: 'robloxPurchasesMade', label: 'Were any purchases made in Roblox during this time?', type: 'select', required: false, options: ['Yes', 'No', 'Other'], categoryBadge: 'Purchases' },
    { id: 'rbx-14', name: 'robloxReportedToModeration', label: 'Was this reported to Roblox Moderation, Police or Law Enforcement? (If yes, to whom?):', type: 'text', required: false, placeholder: 'e.g. Reported to Police and Roblox Moderation', categoryBadge: 'Reporting' },
    { id: 'rbx-15', name: 'robloxEmotionalChanges', label: 'Emotional Changes / Symptoms Before:', type: 'text', required: false, placeholder: 'Anxiety, social withdrawal, trauma', categoryBadge: 'Symptoms' },
    { id: 'rbx-16', name: 'robloxSymptomsStartDate', label: 'Symptoms Started Date:', type: 'date', required: false, categoryBadge: 'Symptom Date' },
    { id: 'rbx-17', name: 'robloxDiagnosisConfirmTest', label: 'How did they Confirm your Diagnosis / Test before Diagnosis:', type: 'text', required: false, placeholder: 'Therapist / Psychological evaluation', categoryBadge: 'Diagnosis Test' },
    { id: 'rbx-18', name: 'robloxTestDate', label: 'Date of Test:', type: 'date', required: false, categoryBadge: 'Test Date' },
    { id: 'rbx-19', name: 'robloxTreatment', label: 'Treatment:', type: 'text', required: false, placeholder: 'Therapy, Counseling, Medical Treatment', categoryBadge: 'Treatment' },
    { id: 'rbx-20', name: 'robloxTreatmentDate', label: 'Treatment Date:', type: 'date', required: false, categoryBadge: 'Treatment Date' },
    { id: 'rbx-21', name: 'robloxLegalRepresentation', label: 'Did you have any legal representation with any law firm regarding this claim?', type: 'select', required: true, options: ['Yes', 'No'], categoryBadge: 'Legal Status' },
    { id: 'rbx-22', name: 'robloxFelonyConviction', label: 'Conviction Felony/Crime?', type: 'select', required: true, options: ['YES', 'NO'], categoryBadge: 'Background' },
    { id: 'rbx-23', name: 'robloxMedicalRecords', label: 'Do you have Medical Records?', type: 'select', required: true, options: ['Yes', 'No'], categoryBadge: 'Medical Records' }
  ],

  'LA County JDC Sexual Abuse': [
    { id: 'jdc-1', name: 'jdcFacility', label: 'Which facility were you housed in?', type: 'select', required: true, options: ['Maclaren Hall / MacLaren Juvenile Hall', 'Barry J. Nidorf Juvenile Hall', 'Slymar Juvenile Hall (Barry J. Nidorf Juvenile Hall)', 'Los Padrinos Juvenile Hall', 'Central Juvenile Hall', 'Camp David Gonzales', 'Camp Jarvis', 'Camp Karl Holton', 'Camp Kenyon Scudder', 'Camp Kilpatrick', 'Camp McNair', 'Camp Onizuka', 'Camp Resnick', 'Camp Scobee', 'Camp Scott', 'Camp Smith', 'Challenger Camps', 'Los Prietos Boys Camp', 'Dorothy F. Kirby Center', 'Fred C. Nelles Youth Correctional Facility', 'LAC Afflerbaugh Paige Camp', 'Southern Youth Correctional Reception Center & Clinic'], categoryBadge: 'Facility' },
    { id: 'jdc-2', name: 'jdcDetainedReason', label: 'Reason for getting detained:', type: 'text', required: false, placeholder: 'Reason for detention', categoryBadge: 'Detention Info' },
    { id: 'jdc-3', name: 'jdcPrisonerId', label: 'Prisoner ID:', type: 'text', required: false, placeholder: 'Prisoner ID Number', categoryBadge: 'Detention Info' },
    { id: 'jdc-4', name: 'jdcIntakeDate', label: 'Approximate Intake Date:', type: 'date', required: true, categoryBadge: 'Timeline' },
    { id: 'jdc-5', name: 'jdcReleaseDate', label: 'Approximate Release Date:', type: 'date', required: false, categoryBadge: 'Timeline' },
    { id: 'jdc-6', name: 'jdcCaseBookingNumber', label: 'Juvenile Booking / Case Number / Probation Case Number / Court Case Number:', type: 'text', required: false, placeholder: 'Case / Booking Number', categoryBadge: 'Case Info' },
    { id: 'jdc-7', name: 'jdcHousingUnitDorm', label: 'Housing Unit / Dorm:', type: 'text', required: false, placeholder: 'Unit or Dorm Name', categoryBadge: 'Facility Details' },
    { id: 'jdc-8', name: 'jdcRoomCellIdentifier', label: 'Room / Cell Identifier:', type: 'text', required: false, placeholder: 'Room or Cell Number', categoryBadge: 'Facility Details' },
    { id: 'jdc-9', name: 'jdcBedAssignment', label: 'Bed Assignment:', type: 'text', required: false, placeholder: 'Bed Identifier', categoryBadge: 'Facility Details' },
    { id: 'jdc-10', name: 'jdcAbuserStaffName', label: 'Name & Title/Officer of Alleged Staff Member:', type: 'text', required: true, placeholder: 'Staff Name / Officer Title', categoryBadge: 'Alleged Abuser' },
    { id: 'jdc-11', name: 'jdcFirstAbuseDate', label: 'First Abuse Incident Date:', type: 'date', required: true, categoryBadge: 'Abuse Timeline' },
    { id: 'jdc-12', name: 'jdcLastAbuseDate', label: 'Last Abuse Incident Date:', type: 'date', required: true, categoryBadge: 'Abuse Timeline' },
    { id: 'jdc-13', name: 'jdcAbuseCount', label: 'How many times were you Abused?', type: 'text', required: true, placeholder: 'e.g. Multiple times / 5 times', categoryBadge: 'Frequency' },
    { id: 'jdc-14', name: 'jdcAbuseLocationRoom', label: 'Which Place / Room did it occur in Detention Center?', type: 'text', required: false, placeholder: 'e.g. Cell, Bathroom, Showers, Office', categoryBadge: 'Location' },
    { id: 'jdc-15', name: 'jdcReportedInCustody', label: 'Did you report this incident while in custody?', type: 'select', required: false, options: ['Family Member', 'Counselor', 'Probation Officer', 'No One'], categoryBadge: 'Reporting' },
    { id: 'jdc-16', name: 'jdcIncidentNarrative', label: 'Describe the whole Incident what happened:', type: 'textarea', required: true, placeholder: 'Describe the incident in detail...', categoryBadge: 'Narrative' },
    { id: 'jdc-17', name: 'jdcEmotionalChanges', label: 'Emotional Changes / Symptoms Before:', type: 'text', required: false, placeholder: 'Describe trauma or emotional changes', categoryBadge: 'Symptoms' },
    { id: 'jdc-18', name: 'jdcSymptomsStartDate', label: 'Symptoms Started Date:', type: 'date', required: false, categoryBadge: 'Symptom Date' },
    { id: 'jdc-19', name: 'jdcDiagnosisConfirmTest', label: 'How did they Confirm your Diagnosis / Test before Diagnosis:', type: 'text', required: false, placeholder: 'Psychiatric evaluation, therapy assessment', categoryBadge: 'Diagnosis Test' },
    { id: 'jdc-20', name: 'jdcTestDate', label: 'Date of Test:', type: 'date', required: false, categoryBadge: 'Test Date' },
    { id: 'jdc-21', name: 'jdcTreatment', label: 'Treatment:', type: 'text', required: false, placeholder: 'Counseling, medication, therapy', categoryBadge: 'Treatment' },
    { id: 'jdc-22', name: 'jdcTreatmentDate', label: 'Treatment Date:', type: 'date', required: false, categoryBadge: 'Treatment Date' },
    { id: 'jdc-23', name: 'jdcLegalRepresentation', label: 'Did you have any legal representation with any law firm regarding this claim?', type: 'select', required: true, options: ['Yes', 'No'], categoryBadge: 'Legal Status' },
    { id: 'jdc-24', name: 'jdcFelonyConviction', label: 'Conviction Felony/Crime?', type: 'select', required: true, options: ['YES', 'NO'], categoryBadge: 'Background' },
    { id: 'jdc-25', name: 'jdcMedicalRecords', label: 'Do you have Medical Records?', type: 'select', required: true, options: ['Yes', 'No'], categoryBadge: 'Medical Records' },
    { id: 'jdc-26', name: 'jdcJuvenileRecords', label: 'Do you have Juvenile Records?', type: 'select', required: true, options: ['Yes', 'No'], categoryBadge: 'Juvenile Records' }
  ],

  'Camp Lejeune': [
    { id: 'cl-1', name: 'clDatesOnBase', label: 'Dates Lived or Worked at Camp Lejeune (Must be between 1953 - 1987):', type: 'text', required: true, placeholder: 'e.g. 1978 - 1982', categoryBadge: 'Timeline' },
    { id: 'cl-2', name: 'clMilitaryStatus', label: 'Claimant Military / Residency Status:', type: 'select', required: true, options: ['Marine Corps Veteran', 'Navy Veteran', 'Military Family Member / Dependent', 'Civilian Employee / Contractor', 'In-Utero Exposure'], categoryBadge: 'Status' },
    { id: 'cl-3', name: 'clDiagnosis', label: 'Diagnosed Qualifying Condition:', type: 'select', required: true, options: ['Kidney Cancer', 'Liver Cancer', 'Non-Hodgkin Lymphoma', 'Leukemia', 'Multiple Myeloma', 'Parkinson\'s Disease', 'Bladder Cancer', 'Aplastic Anemia', 'Other Condition'], categoryBadge: 'Diagnosis' },
    { id: 'cl-4', name: 'clDiagnosisDate', label: 'Date of Diagnosis:', type: 'date', required: true, categoryBadge: 'Diagnosis Date' },
    { id: 'cl-5', name: 'clHospital', label: 'Hospital / VA Medical Facility:', type: 'text', required: false, placeholder: 'VA Hospital or Clinic Name', categoryBadge: 'Facility' }
  ],

  'Roundup': [
    { id: 'ru-1', name: 'roundupExposureYears', label: 'Years of Exposure to Roundup / Glyphosate Herbicide:', type: 'select', required: true, options: ['1-3 Years', '3-5 Years', '5-10 Years', '10+ Years'], categoryBadge: 'Exposure' },
    { id: 'ru-2', name: 'roundupUserType', label: 'Primary Use Type:', type: 'select', required: true, options: ['Commercial Applicator / Farmer / Landscaper', 'Residential / Homeowner Garden Use', 'Industrial / Highway Worker'], categoryBadge: 'User Type' },
    { id: 'ru-3', name: 'roundupDiagnosis', label: 'Diagnosed Cancer Type:', type: 'select', required: true, options: ['Non-Hodgkin Lymphoma (NHL)', 'Chronic Lymphocytic Leukemia (CLL)', 'Multiple Myeloma', 'B-Cell Lymphoma'], categoryBadge: 'Diagnosis' },
    { id: 'ru-4', name: 'roundupDiagnosisDate', label: 'Date of Diagnosis:', type: 'date', required: true, categoryBadge: 'Diagnosis Date' }
  ],

  'Talcum': [
    { id: 'talc-1', name: 'talcUsageYears', label: 'Years of Daily Cosmetic Talcum Powder Use (Johnson & Johnson):', type: 'select', required: true, options: ['1-5 Years', '5-10 Years', '10-20 Years', '20+ Years'], categoryBadge: 'Usage Duration' },
    { id: 'talc-2', name: 'talcBrand', label: 'Talcum Powder Brand Used:', type: 'select', required: true, options: ['Johnson\'s Baby Powder', 'Shower to Shower', 'Both'], categoryBadge: 'Brand' },
    { id: 'talc-3', name: 'talcDiagnosis', label: 'Diagnosed Medical Condition:', type: 'select', required: true, options: ['Ovarian Cancer', 'Mesothelioma', 'Endometrial Cancer'], categoryBadge: 'Diagnosis' },
    { id: 'talc-4', name: 'talcBiopsyConfirmation', label: 'Was Biopsy Tissue Confirmed Positive for Talc/Asbestos?', type: 'select', required: false, options: ['Yes', 'No', 'Unknown'], categoryBadge: 'Biopsy' }
  ],

  'NEC Baby Formula': [
    { id: 'nec-1', name: 'necFormulaBrand', label: 'Infant Formula Brand Fed to Premature Baby:', type: 'select', required: true, options: ['Similac (Abbott)', 'Enfamil (Mead Johnson)', 'Both Brands'], categoryBadge: 'Formula Brand' },
    { id: 'nec-2', name: 'necBirthWeeks', label: 'Gestational Age at Birth (Weeks Premature):', type: 'select', required: true, options: ['Under 28 Weeks', '28 - 32 Weeks', '32 - 37 Weeks'], categoryBadge: 'Gestational Age' },
    { id: 'nec-3', name: 'necSurgeryPerformed', label: 'Was Bowel Resection Surgery Performed?', type: 'select', required: true, options: ['Yes (Bowel Resection)', 'No (Medical Management Only)', 'Deceased'], categoryBadge: 'Surgical Status' },
    { id: 'nec-4', name: 'necHospitalName', label: 'NICU / Children\'s Hospital Name:', type: 'text', required: false, placeholder: 'NICU Facility Name', categoryBadge: 'Hospital' }
  ],

  'Hair Straightener': [
    { id: 'hs-1', name: 'hairStraightenerBrands', label: 'Chemical Hair Straightener / Relaxer Brand Used:', type: 'text', required: true, placeholder: 'e.g. ORS Olive Oil, Just For Me, SoftSheen-Carson, Dark & Lovely', categoryBadge: 'Product' },
    { id: 'hs-2', name: 'hairStraightenerFrequency', label: 'Frequency of Chemical Relaxer Treatments:', type: 'select', required: true, options: ['4+ Times Per Year (Frequent)', '1-3 Times Per Year', 'Occasional Use'], categoryBadge: 'Frequency' },
    { id: 'hs-3', name: 'hairStraightenerDiagnosis', label: 'Diagnosed Cancer Condition:', type: 'select', required: true, options: ['Uterine Cancer', 'Endometrial Cancer', 'Ovarian Cancer', 'Uterine Fibroids (Requiring Hysterectomy)'], categoryBadge: 'Diagnosis' },
    { id: 'hs-4', name: 'hairStraightenerHysterectomy', label: 'Was Hysterectomy Surgery Performed?', type: 'select', required: false, options: ['Yes (Total Hysterectomy)', 'Yes (Partial)', 'No'], categoryBadge: 'Surgery' }
  ],

  'Wildfire': [
    { id: 'wf-1', name: 'wildfireName', label: 'Wildfire Event Name:', type: 'text', required: true, placeholder: 'e.g. Eaton Fire, Marshall Fire, Camp Fire, Lahaina Fire', categoryBadge: 'Wildfire Event' },
    { id: 'wf-2', name: 'wildfireAddress', label: 'Damaged Property Address:', type: 'text', required: true, placeholder: 'Full Property Street Address', categoryBadge: 'Location' },
    { id: 'wf-3', name: 'wildfireLossType', label: 'Primary Loss Type:', type: 'select', required: true, options: ['Total Structure Destruction', 'Partial Structure Damage / Smoke', 'Business Interruption / Income Loss', 'Personal Injury / Smoke Inhalation'], categoryBadge: 'Loss Type' },
    { id: 'wf-4', name: 'wildfireEstimatedLoss', label: 'Estimated Uncompensated Financial Loss ($):', type: 'text', required: false, placeholder: 'e.g. $250,000', categoryBadge: 'Financial Loss' }
  ],

  'AFFF Firefighting Foam': [
    { id: 'afff-1', name: 'afffOccupation', label: 'Firefighter / Military Occupation:', type: 'select', required: true, options: ['Military Firefighter', 'Career Municipal Firefighter', 'Volunteer Firefighter', 'Airport / Aviation Firefighter'], categoryBadge: 'Occupation' },
    { id: 'afff-2', name: 'afffServiceYears', label: 'Years Serving as Firefighter Exposed to Foam:', type: 'text', required: true, placeholder: 'e.g. 1985-2010', categoryBadge: 'Years Active' },
    { id: 'afff-3', name: 'afffDiagnosis', label: 'Diagnosed Cancer Type:', type: 'select', required: true, options: ['Kidney Cancer', 'Testicular Cancer', 'Prostate Cancer', 'Pancreatic Cancer', 'Leukemia / Lymphoma'], categoryBadge: 'Diagnosis' }
  ],

  'Depo-Provera': [
    { id: 'dp-1', name: 'depoDuration', label: 'How long did you use the Depo-Provera injections?', type: 'text', required: true, placeholder: 'e.g. 2 years / 6 months', categoryBadge: 'Exposure Duration' },
    { id: 'dp-2', name: 'depoFrequency', label: 'How often did you receive Depo-Provera Injections?', type: 'text', required: true, placeholder: 'e.g. Every 3 months', categoryBadge: 'Usage Frequency' },
    { id: 'dp-3', name: 'depoTotalInjections', label: 'Total Depo-Provera Injections received?', type: 'text', required: true, placeholder: 'e.g. 8 injections', categoryBadge: 'Dosage Count' },
    { id: 'dp-4', name: 'depoStartDate', label: 'When did you Start receiving:', type: 'date', required: true, categoryBadge: 'Timeline' },
    { id: 'dp-5', name: 'depoStopDate', label: 'When did you Stop receiving:', type: 'date', required: true, categoryBadge: 'Timeline' },
    { id: 'dp-6', name: 'depoAdministeredLocation', label: 'Where was the Injection Administered?', type: 'text', required: false, placeholder: 'Facility / Clinic Name', categoryBadge: 'Facility' },
    { id: 'dp-7', name: 'depoAddressAdministered', label: 'What Location/Address was Injection Administered?', type: 'text', required: false, placeholder: 'Full Clinic Street Address', categoryBadge: 'Location' },
    { id: 'dp-8', name: 'depoStopReasonSymptoms', label: 'Reason for Stopping Depo-Provera / Symptoms Before Diagnosis:', type: 'textarea', required: false, placeholder: 'Describe headaches, vision problems, seizures, or symptoms...', categoryBadge: 'Symptoms & Reason' },
    { id: 'dp-9', name: 'depoSymptomsStartDate', label: 'Symptoms Started Date:', type: 'date', required: false, categoryBadge: 'Symptom Timeline' },
    { id: 'dp-10', name: 'depoDiagnosisConfirmTest', label: 'How did they Confirm your Diagnosis / Test before Diagnosis:', type: 'text', required: true, placeholder: 'e.g. Brain MRI Scan, CT Scan, Biopsy', categoryBadge: 'Diagnosis Test' },
    { id: 'dp-11', name: 'depoTestDate', label: 'Date of Test:', type: 'date', required: false, categoryBadge: 'Test Date' },
    { id: 'dp-12', name: 'depoTreatment', label: 'Treatment Received:', type: 'text', required: false, placeholder: 'e.g. Surgery, Craniotomy, Radiation, Medication', categoryBadge: 'Treatment' },
    { id: 'dp-13', name: 'depoTreatmentDate', label: 'Treatment Date:', type: 'date', required: false, categoryBadge: 'Treatment Date' },
    { id: 'dp-14', name: 'depoLongTermComplications', label: 'Have you suffered any long-term complications, like infertility?', type: 'select', required: true, options: ['Yes', 'No'], categoryBadge: 'Complications' },
    { id: 'dp-15', name: 'depoHivAids', label: 'HIV/AIDS?', type: 'select', required: false, options: ['Yes', 'No'], categoryBadge: 'Medical History' },
    { id: 'dp-16', name: 'depoLegalRepresentation', label: 'Did you have any legal representation with any law firm regarding this claim?', type: 'select', required: true, options: ['Yes', 'No'], categoryBadge: 'Legal Status' },
    { id: 'dp-17', name: 'depoFelonyConviction', label: 'Conviction Felony/Crime?', type: 'select', required: true, options: ['YES', 'NO'], categoryBadge: 'Background' },
    { id: 'dp-18', name: 'depoMedicalRecords', label: 'Do you have Medical Records?', type: 'select', required: true, options: ['Yes', 'No'], categoryBadge: 'Records Status' }
  ],

  'Personal Injury': [
    { id: 'pi-1', name: 'piIncidentType', label: 'Personal Injury Type:', type: 'select', required: true, options: ['Motor Vehicle Accident', 'Slip and Fall', 'Medical Malpractice', 'Workplace Injury', 'Product Liability / Defect'], categoryBadge: 'Accident Type' },
    { id: 'pi-2', name: 'piIncidentDate', label: 'Date of Accident / Injury:', type: 'date', required: true, categoryBadge: 'Incident Date' },
    { id: 'pi-3', name: 'piInjuryDescription', label: 'Describe Injuries Sustained:', type: 'textarea', required: true, placeholder: 'Describe bone fractures, surgeries, spinal injuries...', categoryBadge: 'Injuries' },
    { id: 'pi-4', name: 'piAtFaultParty', label: 'At-Fault Party / Insurance Company:', type: 'text', required: false, placeholder: 'Insurance Carrier Name', categoryBadge: 'Insurance' }
  ],

  'Mass Tort - General': [
    { id: 'gen-1', name: 'generalTortCategory', label: 'Specific Litigation / Exposure Category:', type: 'text', required: true, placeholder: 'Litigation Category', categoryBadge: 'Category' },
    { id: 'gen-2', name: 'generalIncidentDate', label: 'Date of Exposure or Incident:', type: 'date', required: true, categoryBadge: 'Timeline' },
    { id: 'gen-3', name: 'generalDiagnosis', label: 'Diagnosed Condition / Injury:', type: 'text', required: true, placeholder: 'Diagnosis details', categoryBadge: 'Diagnosis' },
    { id: 'gen-4', name: 'generalHospital', label: 'Medical Facility Name:', type: 'text', required: false, placeholder: 'Hospital Name', categoryBadge: 'Facility' }
  ]
};

let cachedApiQuestionsMap: TortQuestionsMap | null = null;

export async function fetchCentralQuestionsFromApi(): Promise<TortQuestionsMap> {
  if (typeof window === 'undefined') return DEFAULT_TORT_QUESTIONS;
  try {
    const res = await fetch('/api/settings/questions');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.questionsMap) {
        cachedApiQuestionsMap = data.questionsMap;
        localStorage.setItem('custom_tort_questions_map', JSON.stringify(data.questionsMap));
        return data.questionsMap;
      }
    }
  } catch (err) {
    console.warn('Could not sync tort questions from API, using local fallback:', err);
  }
  return DEFAULT_TORT_QUESTIONS;
}

export function getQuestionsForTort(tortType: string): TortQuestion[] {
  if (!tortType) return DEFAULT_TORT_QUESTIONS['Rideshare'];

  // Check API cached map first
  if (cachedApiQuestionsMap && cachedApiQuestionsMap[tortType] && cachedApiQuestionsMap[tortType].length > 0) {
    return cachedApiQuestionsMap[tortType];
  }

  // Load from localStorage if customized
  if (typeof window !== 'undefined') {
    const savedMap = localStorage.getItem('custom_tort_questions_map');
    if (savedMap) {
      try {
        const parsed: TortQuestionsMap = JSON.parse(savedMap);
        if (parsed[tortType] && parsed[tortType].length > 0) {
          return parsed[tortType];
        }
      } catch (_) {}
    }
  }

  // Match exact preset
  if (DEFAULT_TORT_QUESTIONS[tortType]) {
    return DEFAULT_TORT_QUESTIONS[tortType];
  }

  // Fallback search
  const keys = Object.keys(DEFAULT_TORT_QUESTIONS);
  const match = keys.find(k => k.toLowerCase() === tortType.toLowerCase() || tortType.toLowerCase().includes(k.toLowerCase()));
  if (match) {
    return DEFAULT_TORT_QUESTIONS[match];
  }

  return DEFAULT_TORT_QUESTIONS['Mass Tort - General'];
}

