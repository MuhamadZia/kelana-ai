
def get_trip_category(budget:float) -> str:
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"
    
def get_travel_season(month:str) -> str:
    if month.lower() == "december":
        return "Peak Season"
    elif month.lower() == "june":
        return "Holiday Season"
    else:
        return "Regular Season"

def calculate_daily_budget(budget:float, days:int) -> float:
    return budget / days

def recommend_places() -> list[str]:
    return [
        "Tokyo Tower",
        "Shibuya",
        "Mount Fuji"
    ]

def option_transportations() -> list[str]:
    return [
        "Bus",
        "Train",
        "Flight"
    ]