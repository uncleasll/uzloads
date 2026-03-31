import sys
sys.path.insert(0, '.')
from datetime import date, timedelta
from models.base import SessionLocal, engine, Base
from models.driver import Driver
from models.load import Load
Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        if db.query(Driver).count() > 0:
            print("Already seeded.")
            return
        today = date.today()
        d1 = Driver(first_name="Marcus", last_name="Johnson",
            phone="(312) 555-0101", email="marcus@example.com",
            truck_number="T-101", trailer_number="TR-205",
            pay_type="freight_percent", pay_rate=0.32, status="active",
            cdl_number="IL-D1234567",
            cdl_expiration=today + timedelta(days=365),
            medical_card_expiration=today + timedelta(days=180),
            drug_test_date=today - timedelta(days=30),
            drug_test_result="pass", mvr_date=today - timedelta(days=60), mvr_status="clear")
        d2 = Driver(first_name="Carlos", last_name="Rivera",
            phone="(773) 555-0202", email="carlos@example.com",
            truck_number="T-102", trailer_number="TR-210",
            pay_type="freight_percent", pay_rate=0.90, status="active",
            cdl_number="IL-D7654321",
            cdl_expiration=today + timedelta(days=20),
            medical_card_expiration=today - timedelta(days=10),
            drug_test_date=today - timedelta(days=90),
            drug_test_result="pass", mvr_date=today - timedelta(days=30), mvr_status="clear")
        d3 = Driver(first_name="James", last_name="Williams",
            phone="(847) 555-0303", truck_number="T-103",
            pay_type="per_mile", pay_rate=0.55, status="active",
            cdl_expiration=today + timedelta(days=500),
            medical_card_expiration=today + timedelta(days=300),
            drug_test_result="pass", mvr_status="clear")
        db.add_all([d1, d2, d3])
        db.flush()
        loads = [
            Load(load_number="UZ-10001", driver_id=d1.id,
                broker_name="Echo Global Logistics",
                pickup_city="Chicago", pickup_state="IL",
                pickup_date=today - timedelta(days=15),
                delivery_city="Dallas", delivery_state="TX",
                delivery_date=today - timedelta(days=13),
                rate=2400.00, fuel_surcharge=120.00, total_rate=2520.00,
                status="delivered", miles=920, equipment_type="Dry Van"),
            Load(load_number="UZ-10002", driver_id=d1.id,
                broker_name="Coyote Logistics",
                pickup_city="Dallas", pickup_state="TX",
                pickup_date=today - timedelta(days=10),
                delivery_city="Los Angeles", delivery_state="CA",
                delivery_date=today - timedelta(days=7),
                rate=3100.00, detention=150.00, fuel_surcharge=155.00,
                total_rate=3405.00, status="delivered", miles=1432,
                equipment_type="Dry Van"),
            Load(load_number="UZ-10003", driver_id=d2.id,
                broker_name="XPO Logistics",
                pickup_city="Atlanta", pickup_state="GA",
                pickup_date=today - timedelta(days=5),
                delivery_city="Miami", delivery_state="FL",
                delivery_date=today - timedelta(days=3),
                rate=1800.00, fuel_surcharge=90.00, total_rate=1890.00,
                status="delivered", miles=662, equipment_type="Reefer"),
            Load(load_number="UZ-10004", driver_id=d3.id,
                broker_name="TQL",
                pickup_city="Nashville", pickup_state="TN",
                pickup_date=today - timedelta(days=2),
                delivery_city="Charlotte", delivery_state="NC",
                delivery_date=today + timedelta(days=1),
                rate=1200.00, fuel_surcharge=60.00, total_rate=1260.00,
                status="en_route", miles=408, equipment_type="Dry Van"),
            Load(load_number="UZ-10005", driver_id=d1.id,
                broker_name="Landstar",
                pickup_city="Phoenix", pickup_state="AZ",
                pickup_date=today + timedelta(days=3),
                delivery_city="Denver", delivery_state="CO",
                delivery_date=today + timedelta(days=5),
                rate=2200.00, fuel_surcharge=110.00, total_rate=2310.00,
                status="new", miles=601, equipment_type="Flatbed"),
        ]
        db.add_all(loads)
        db.commit()
        print("Seeded 3 drivers and 5 loads!")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()