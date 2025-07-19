import os
from datetime import datetime
from typing import List
import pandas as pd
import logging

from ..models import Coffee


class DataSaver:
    def __init__(self, base_dir: str = "data"):
        self.base_dir = base_dir
        self.raw_dir = os.path.join(base_dir, "raw")
        self.processed_dir = os.path.join(base_dir, "processed")
        self.logger = logging.getLogger(self.__class__.__name__)
        
        os.makedirs(self.raw_dir, exist_ok=True)
        os.makedirs(self.processed_dir, exist_ok=True)
    
    def save_to_csv(self, coffees: List[Coffee], filename: str = None):
        if not coffees:
            self.logger.warning("No coffee data to save")
            return
        
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"coffee_data_{timestamp}.csv"
        
        filepath = os.path.join(self.processed_dir, filename)
        
        try:
            df = pd.DataFrame([coffee.to_dict() for coffee in coffees])
            df.to_csv(filepath, index=False, encoding='utf-8-sig')
            self.logger.info(f"Saved {len(coffees)} coffee records to {filepath}")
            return filepath
        except Exception as e:
            self.logger.error(f"Error saving to CSV: {e}")
            return None
    
    def save_to_excel(self, coffees: List[Coffee], filename: str = None):
        if not coffees:
            self.logger.warning("No coffee data to save")
            return
        
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"coffee_data_{timestamp}.xlsx"
        
        filepath = os.path.join(self.processed_dir, filename)
        
        try:
            df = pd.DataFrame([coffee.to_dict() for coffee in coffees])
            
            with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Coffee Data', index=False)
                
                worksheet = writer.sheets['Coffee Data']
                
                for idx, col in enumerate(df.columns):
                    max_length = max(
                        df[col].astype(str).map(len).max(),
                        len(col)
                    )
                    adjusted_width = min(max_length + 2, 50)
                    worksheet.column_dimensions[chr(65 + idx)].width = adjusted_width
            
            self.logger.info(f"Saved {len(coffees)} coffee records to {filepath}")
            return filepath
        except Exception as e:
            self.logger.error(f"Error saving to Excel: {e}")
            return None
    
    def save_by_roastery(self, coffees: List[Coffee]):
        if not coffees:
            self.logger.warning("No coffee data to save")
            return
        
        roastery_groups = {}
        for coffee in coffees:
            if coffee.roastery_name not in roastery_groups:
                roastery_groups[coffee.roastery_name] = []
            roastery_groups[coffee.roastery_name].append(coffee)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        saved_files = []
        for roastery_name, roastery_coffees in roastery_groups.items():
            safe_name = roastery_name.replace(' ', '_').replace('/', '_')
            csv_file = self.save_to_csv(
                roastery_coffees, 
                f"{safe_name}_{timestamp}.csv"
            )
            excel_file = self.save_to_excel(
                roastery_coffees,
                f"{safe_name}_{timestamp}.xlsx"
            )
            
            if csv_file and excel_file:
                saved_files.extend([csv_file, excel_file])
        
        return saved_files
    
    def save_combined(self, coffees: List[Coffee]):
        if not coffees:
            self.logger.warning("No coffee data to save")
            return
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        csv_file = self.save_to_csv(coffees, f"all_coffee_data_{timestamp}.csv")
        excel_file = self.save_to_excel(coffees, f"all_coffee_data_{timestamp}.xlsx")
        
        return [csv_file, excel_file] if csv_file and excel_file else []