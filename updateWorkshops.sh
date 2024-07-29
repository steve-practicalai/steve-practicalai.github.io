#!/bin/bash

wget https://feeds.bookwhen.com/ical/idvv5nkv1e44/pj75f4/public.ics -O public.ics

# Function to parse date
parse_date() {
    date -d "$1" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "$1"
}

# Initialize variables
current_event=""
description=""
events=()

# Read the ICS file line by line
while IFS= read -r line || [[ -n "$line" ]]; do
    line=$(echo "$line" | tr -d '\r')
    
    case "$line" in
        "BEGIN:VEVENT")
            current_event=$(mktemp)
            ;;
        "END:VEVENT")
            if grep -q "location:" "$current_event" && \
               grep -q "date:" "$current_event" && \
               grep -q "title:" "$current_event" && \
               grep -q "url:" "$current_event"; then
                events+=("$current_event")
            else
                rm "$current_event"
            fi
            ;;
        SUMMARY:*)
            summary="${line#SUMMARY:}"
            location="${summary%% - *}"
            title="${summary#* - }"
            echo "location: $location" >> "$current_event"
            echo "title: $title" >> "$current_event"
            ;;
        DTSTART\;TZID=Pacific/Auckland:*)
            date="${line#DTSTART;TZID=Pacific/Auckland:}"
            parsed_date=$(parse_date "$date")
            echo "date: $parsed_date" >> "$current_event"
            ;;
        URL:*)
            url="${line#URL:}"
            echo "url: $url" >> "$current_event"
            event_code="${url##*/}"
            echo "eventCode: $event_code" >> "$current_event"
            ;;
        *)
            if [[ $line =~ ^[[:space:]] && -n $description ]]; then
                description+=" ${line## }"
            fi
            ;;
    esac
done < public.ics

# Output to YAML file
{
    echo "workshops:"
    for event in "${events[@]}"; do
        echo "  -"
        sed 's/^/    /' "$event"
        rm "$event"
    done
} > workshops.yml

echo "Conversion complete. Output written to workshops.yml"