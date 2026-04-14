import mysql.connector
from config import DB_CONFIG

TABLES = {
    'customers': (
        "CREATE TABLE IF NOT EXISTS `customers` ("
        "  `Customer_ID` int NOT NULL AUTO_INCREMENT,"
        "  `Customer_Name` varchar(50) NOT NULL,"
        "  `Phone_No` varchar(15) DEFAULT NULL UNIQUE,"
        "  `City` varchar(30) DEFAULT 'Mumbai',"
        "  PRIMARY KEY (`Customer_ID`)"
        ") ENGINE=InnoDB"
    ),
    'supplier': (
        "CREATE TABLE IF NOT EXISTS `supplier` ("
        "  `Supplier_ID` varchar(10) NOT NULL,"
        "  `Phone_No` varchar(15) DEFAULT NULL,"
        "  `Area` varchar(50) DEFAULT NULL,"
        "  PRIMARY KEY (`Supplier_ID`)"
        ") ENGINE=InnoDB"
    ),
    'product': (
        "CREATE TABLE IF NOT EXISTS `product` ("
        "  `Product_ID` varchar(10) NOT NULL,"
        "  `Product_name` varchar(50) DEFAULT NULL,"
        "  `Supplier_ID` varchar(10) DEFAULT NULL,"
        "  `Stock` int DEFAULT NULL,"
        "  `Check_price` int DEFAULT NULL,"
        "  `Temperature_required` int DEFAULT NULL,"
        "  PRIMARY KEY (`Product_ID`),"
        "  KEY `Supplier_ID` (`Supplier_ID`),"
        "  CONSTRAINT `product_ibfk_1` FOREIGN KEY (`Supplier_ID`) REFERENCES `supplier` (`Supplier_ID`)"
        ") ENGINE=InnoDB"
    ),
    'orders': (
        "CREATE TABLE IF NOT EXISTS `orders` ("
        "  `Order_ID` int NOT NULL AUTO_INCREMENT,"
        "  `Product_ID` varchar(10) DEFAULT NULL,"
        "  `Supplier_ID` varchar(10) DEFAULT NULL,"
        "  `Tracking_No` varchar(30) DEFAULT NULL UNIQUE,"
        "  `Order_Date` date DEFAULT '2024-01-01',"
        "  PRIMARY KEY (`Order_ID`)"
        ") ENGINE=InnoDB"
    ),
    'payment': (
        "CREATE TABLE IF NOT EXISTS `payment` ("
        "  `Payment_ID` int NOT NULL AUTO_INCREMENT,"
        "  `Order_ID` int DEFAULT NULL,"
        "  `Amount` decimal(10,2) NOT NULL,"
        "  `Payment_Mode` varchar(20) DEFAULT NULL,"
        "  `Payment_Date` date DEFAULT NULL,"
        "  PRIMARY KEY (`Payment_ID`),"
        "  KEY `Order_ID` (`Order_ID`),"
        "  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`Order_ID`) REFERENCES `orders` (`Order_ID`)"
        ") ENGINE=InnoDB"
    ),
    'shipment': (
        "CREATE TABLE IF NOT EXISTS `shipment` ("
        "  `Shipment_ID` int NOT NULL AUTO_INCREMENT,"
        "  `Shipment_Date` date NOT NULL DEFAULT '2024-01-01',"
        "  `Order_ID` int NOT NULL,"
        "  `Quantity` int NOT NULL,"
        "  `Tracking_Number` varchar(50) DEFAULT NULL UNIQUE,"
        "  PRIMARY KEY (`Shipment_ID`),"
        "  KEY `Order_ID` (`Order_ID`),"
        "  CONSTRAINT `shipment_ibfk_1` FOREIGN KEY (`Order_ID`) REFERENCES `orders` (`Order_ID`)"
        ") ENGINE=InnoDB"
    ),
    'system_config': (
        "CREATE TABLE IF NOT EXISTS `system_config` ("
        "  `Config_Key` varchar(50) NOT NULL,"
        "  `Config_Value` text,"
        "  PRIMARY KEY (`Config_Key`)"
        ") ENGINE=InnoDB"
    )
}

def setup_database():
    try:
        # Connect to MySQL server
        base_config = DB_CONFIG.copy()
        db_name = base_config.pop('database', None)
        conn = mysql.connector.connect(**base_config)
        cursor = conn.cursor()

        # Create database
        print(f"Creating database {db_name} if not exists...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        cursor.execute(f"USE {db_name}")

        # Create tables
        for table_name, table_sql in TABLES.items():
            print(f"Creating table {table_name}...")
            cursor.execute(table_sql)

        # Seed data (optional enhancement)
        print("Database setup complete!")
        
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"Error: {err}")

if __name__ == "__main__":
    setup_database()
