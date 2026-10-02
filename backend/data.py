ORGANIZATIONS = {
    "ABC Bank": {
        "risk": 78,
        "exposure": 9000000,
        "budget": 1500000,
        "controls": [
            {
                "name": "Endpoint Detection & Response",
                "cost": 400000,
                "risk_reduction": 25,
            },
            {
                "name": "Backup & Recovery",
                "cost": 300000,
                "risk_reduction": 20,
            },
            {
                "name": "Multi-Factor Authentication",
                "cost": 200000,
                "risk_reduction": 15,
            },
            {
                "name": "Security Awareness Training",
                "cost": 100000,
                "risk_reduction": 10,
            },
            {
                "name": "Data Loss Prevention",
                "cost": 400000,
                "risk_reduction": 16,
            },
            {
                "name": "Next-Gen Firewall",
                "cost": 500000,
                "risk_reduction": 18,
            },
        ],
    },

    "NovaTech Solutions": {
        "risk": 64,
        "exposure": 6200000,
        "budget": 1200000,
        "controls": [
            {
                "name": "Cloud Security Monitoring",
                "cost": 300000,
                "risk_reduction": 20,
            },
            {
                "name": "Multi-Factor Authentication",
                "cost": 200000,
                "risk_reduction": 17,
            },
            {
                "name": "Endpoint Detection & Response",
                "cost": 350000,
                "risk_reduction": 22,
            },
            {
                "name": "Secure Backup",
                "cost": 250000,
                "risk_reduction": 14,
            },
            {
                "name": "Developer Security Training",
                "cost": 150000,
                "risk_reduction": 11,
            },
            {
                "name": "Web Application Firewall",
                "cost": 250000,
                "risk_reduction": 15,
            },
        ],
    },

    "MediCore Healthcare": {
        "risk": 71,
        "exposure": 7800000,
        "budget": 1400000,
        "controls": [
            {
                "name": "Medical Device Security",
                "cost": 450000,
                "risk_reduction": 24,
            },
            {
                "name": "Identity & Access Management",
                "cost": 250000,
                "risk_reduction": 18,
            },
            {
                "name": "Endpoint Protection",
                "cost": 300000,
                "risk_reduction": 19,
            },
            {
                "name": "Encrypted Backup",
                "cost": 300000,
                "risk_reduction": 17,
            },
            {
                "name": "Staff Security Training",
                "cost": 100000,
                "risk_reduction": 9,
            },
            {
                "name": "Data Loss Prevention",
                "cost": 350000,
                "risk_reduction": 15,
            },
        ],
    },

    "ShopSphere Retail": {
        "risk": 58,
        "exposure": 5100000,
        "budget": 1000000,
        "controls": [
            {
                "name": "Payment Security",
                "cost": 300000,
                "risk_reduction": 21,
            },
            {
                "name": "Web Application Firewall",
                "cost": 200000,
                "risk_reduction": 16,
            },
            {
                "name": "Fraud Detection",
                "cost": 250000,
                "risk_reduction": 18,
            },
            {
                "name": "Multi-Factor Authentication",
                "cost": 150000,
                "risk_reduction": 13,
            },
            {
                "name": "Cloud Backup",
                "cost": 200000,
                "risk_reduction": 12,
            },
            {
                "name": "Security Awareness Training",
                "cost": 100000,
                "risk_reduction": 8,
            },
        ],
    },
}


def get_organization(name: str):
    return ORGANIZATIONS.get(name)


def get_all_organizations():
    return ORGANIZATIONS
