from typing import List, Dict


def optimize(
    controls: List[Dict],
    budget: int,
    objective: str,
):
    if not controls or budget <= 0:
        return []

    if objective == "maximum-risk-reduction":
        return _maximum_risk_reduction(controls, budget)

    if objective == "best-value":
        return _best_value(controls, budget)

    return _balanced(controls, budget)


def _maximum_risk_reduction(
    controls: List[Dict],
    budget: int,
):
    unit = 10000
    capacity = budget // unit

    dp = [0.0] * (capacity + 1)
    selected = [[] for _ in range(capacity + 1)]

    for index, control in enumerate(controls):
        cost_units = control["cost"] // unit

        if cost_units > capacity:
            continue

        for current in range(
            capacity,
            cost_units - 1,
            -1,
        ):
            candidate = (
                dp[current - cost_units]
                + control["risk_reduction"]
            )

            if candidate > dp[current]:
                dp[current] = candidate
                selected[current] = (
                    selected[current - cost_units]
                    + [index]
                )

    chosen_indexes = selected[capacity]

    return [
        controls[i]
        for i in chosen_indexes
    ]


def _best_value(
    controls: List[Dict],
    budget: int,
):
    ranked = sorted(
        controls,
        key=lambda control: (
            control["risk_reduction"]
            / control["cost"]
        ),
        reverse=True,
    )

    chosen = []
    remaining = budget

    for control in ranked:
        if control["cost"] <= remaining:
            chosen.append(control)
            remaining -= control["cost"]

    return chosen


def _balanced(
    controls: List[Dict],
    budget: int,
):
    if not controls:
        return []

    max_reduction = max(
        control["risk_reduction"]
        for control in controls
    )

    ranked = []

    for control in controls:
        efficiency = (
            control["risk_reduction"]
            / control["cost"]
        )

        normalized_reduction = (
            control["risk_reduction"]
            / max_reduction
        )

        score = (
            normalized_reduction * 0.7
            + efficiency * 1000000 * 0.3
        )

        ranked.append(
            (score, control)
        )

    ranked.sort(
        key=lambda item: item[0],
        reverse=True,
    )

    chosen = []
    remaining = budget

    for _, control in ranked:
        if control["cost"] <= remaining:
            chosen.append(control)
            remaining -= control["cost"]

    return chosen
