def print_trip_summary(destination, country, days, budget, currency, travel_month):
    print("========================")
    print("KelanaAI")
    print("========================")
    print(f"Destination : {destination}")
    print(f"Country     : {country}")
    print(f"Days        : {days}")
    print(f"Budget      : {budget}")
    print(f"Currency    : {currency}")
    print(f"Travel Month: {travel_month}")

# Call it with any trip
destination = input("destination    : ")
country = input("country    : ")
days = int(input("days    : "))
budget = float(input("budget    : "))
currency = input("currency    : ")
travel_month = input("travel month    : ")

print_trip_summary(destination, country, days, budget, currency, travel_month)
