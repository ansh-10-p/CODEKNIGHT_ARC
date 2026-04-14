import numpy as np

def get_explanation(input_data, prediction):
    """
    Generates a human-readable explanation for the prediction based on input features.
    input_data: dict with keys ['study_hours', 'attendance', 'internal_marks', 'assignments']
    prediction: string ('at_risk', 'average', 'high_performer')
    """
    reasons = []
    
    # Thresholds based on typical data distribution or logical cutoffs
    # (These could also be derived from the training set statistics)
    thresholds = {
        'study_hours': 4.5,      # Average study hours usually ~5
        'attendance': 70.0,      # Standard attendance cutoff
        'internal_marks': 60.0,  # Passing/Average marks
        'assignments': 5.0       # Average number of papers/assignments
    }

    if prediction == "at_risk":
        if input_data['attendance'] < thresholds['attendance']:
            reasons.append("low attendance")
        if input_data['internal_marks'] < thresholds['internal_marks']:
            reasons.append("low internal marks")
        if input_data['study_hours'] < thresholds['study_hours']:
            reasons.append("low study hours")
        if input_data['assignments'] < thresholds['assignments']:
            reasons.append("fewer assignments completed")
        
        if not reasons:
            return ["critical performance indicators are below average"]
        
        return reasons

    elif prediction == "high_performer":
        if input_data['attendance'] >= 85:
            reasons.append("excellent attendance")
        if input_data['internal_marks'] >= 80:
            reasons.append("high internal marks")
        if input_data['study_hours'] >= 7:
            reasons.append("consistent study habits")
        
        if not reasons:
            return ["strong academic indicators across all metrics"]
        
        return reasons

    else: # average
        return ["consistent performance with room for improvement in specific areas"]

# Example usage:
# print(get_explanation({'study_hours': 3, 'attendance': 65, 'internal_marks': 55, 'assignments': 60}, 'at_risk'))
