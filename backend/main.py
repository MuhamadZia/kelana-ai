def print_trip_summary(destination, days, budget, travel_style, cost):
    print("========================")
    print("KelanaAI")
    print("========================")
    print(f"Destination : {destination}")
    print(f"Days        : {days}")
    print(f"Budget      : {budget}")
    print(f"Style       : {travel_style}")
    print(f"Cost        : {cost}")

# Call it with any trip
print_trip_summary("Japan", 5, 1500, "Family", 100)
print_trip_summary("Bali", 3, 800, "Backpacker", 100)
