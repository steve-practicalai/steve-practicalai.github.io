#!/bin/bash

# Set the output file
output_file="sitemap.xml"

# Start the XML file
echo '<?xml version="1.0" encoding="UTF-8"?>' > "$output_file"
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:custom="http://www.example.com/schemas/custom-sitemap">' >> "$output_file"

# Add the homepage
echo '  <url>' >> "$output_file"
echo '    <loc>https://practicalai.co.nz/</loc>' >> "$output_file"
echo "    <lastmod>$(date +%Y-%m-%d)</lastmod>" >> "$output_file"
echo '    <changefreq>weekly</changefreq>' >> "$output_file"
echo '    <priority>1.0</priority>' >> "$output_file"
echo '    <custom:title>Practical AI Home</custom:title>' >> "$output_file"
echo '  </url>' >> "$output_file"

# Process all YAML files in the content/yaml/blog/ directory
for file in content/yaml/blog/*.yml
do
    # Extract the file number (assuming files are named 1.yml, 2.yml, etc.)
    file_number=$(basename "$file" .yml)
    
    # Extract title, date, and image from the YAML file
    title=$(sed -n 's/^  title: //p' "$file" | sed 's/^[[:space:]]*//')
    date=$(sed -n 's/^  date: //p' "$file" | sed 's/^[[:space:]]*//')
    image=$(sed -n 's/^  image: //p' "$file" | sed 's/^[[:space:]]*//')
    
    # Add the blog post URL to the sitemap
    echo '  <url>' >> "$output_file"
    echo "    <loc>https://practicalai.co.nz/#/blog/$file_number</loc>" >> "$output_file"
    echo "    <lastmod>$date</lastmod>" >> "$output_file"
    echo '    <changefreq>monthly</changefreq>' >> "$output_file"
    echo '    <priority>0.8</priority>' >> "$output_file"
    echo "    <custom:title>$title</custom:title>" >> "$output_file"
    echo "    <custom:image>https://practicalai.co.nz$image</custom:image>" >> "$output_file"
    echo '  </url>' >> "$output_file"
done

# Close the XML file
echo '</urlset>' >> "$output_file"

echo "Enhanced sitemap generated successfully: $output_file"