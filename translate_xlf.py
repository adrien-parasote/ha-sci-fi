import xml.etree.ElementTree as ET

tree = ET.parse("xliff/fr.xlf")
root = tree.getroot()
ns = {"xliff": "urn:oasis:names:tc:xliff:document:1.2"}
ET.register_namespace("", ns["xliff"])

translations = {
    "Visibility": "Visibilité",
    "Header message (optional)": "Message d'en-tête (optionnel)",
    "HA filter label (e.g. water)": "Label de filtrage HA (ex: water)",
    "Default floor (Floor ID)": "Étage par défaut (ID de l'étage)",
    "Default icon": "Icône par défaut",
    "Automations / No device": "Automatisations / Aucun appareil",
    "Water Management": "Gestion de l'Eau",
    "No floor configured": "Aucun étage configuré",
    "No water equipment configured for this floor": "Aucun équipement d'eau configuré pour cet étage",
    "Automations": "Automatisations",
    "Device": "Appareil",
    "Unavailable": "Indisponible",
    "Select...": "Sélectionner...",
    "Unknown": "Inconnu",
    "ACTIVE": "ACTIF",
    "OFF": "DÉSACTIVÉ",
    "Turned off": "Éteint",
    "Turned on": "Allumé",
    "Option changed": "Option modifiée"
}

updated = 0
for tu in root.findall(".//xliff:trans-unit", ns):
    source = tu.find("xliff:source", ns)
    target = tu.find("xliff:target", ns)
    
    if source is not None and source.text in translations:
        if target is None:
            target = ET.SubElement(tu, "xliff:target")
        target.text = translations[source.text]
        updated += 1

tree.write("xliff/fr.xlf", encoding="utf-8", xml_declaration=True)
print(f"Updated fr.xlf with {updated} translations.")
