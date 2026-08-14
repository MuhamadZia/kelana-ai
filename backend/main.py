from services.trip_service import get_trip_category, recommend_places, get_travel_season, calculate_daily_budget

def print_trip_summary(destination, country, days, budget, currency, travel_month):
    print("========================")
    print("KelanaAI")
    print("========================")
    print(f"Destination : {destination}")
    print(f"Country     : {country}")
    print(f"Days        : {days}")
    print(f"Budget      : {budget}")
    print(f"Category    : {get_trip_category(budget)}")
    print(f"Currency    : {currency}")
    print(f"Daily Budget: {f"{calculate_daily_budget(budget, days)} {currency}/Day"}")
    print(f"Travel Month: {travel_month}")
    print(f"Season      : {get_travel_season(travel_month)}")

    print("\n")
    print("Recommended Places")
    for item in recommend_places():
        print(f"- {item}")

# Call it with any trip
destination = input("destination    : ")
country = input("country    : ")
days = int(input("days    : "))
budget = float(input("budget    : "))
currency = input("currency    : ")
travel_month = input("travel month    : ")

print_trip_summary(destination, country, days, budget, currency, travel_month)
