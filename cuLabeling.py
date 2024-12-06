import boto3

# Parameters based on your inputs
source_bucket = "cropsimagesunlabeled"  # Source S3 bucket with images
source_prefix = "cucumber/ini/"         # Folder containing the images
output_bucket = "crop-images-labeled"   # Destination S3 bucket for the manifest file
manifest_file_name = "cuIniManifest.json"  # Name for the manifest file
label_name = "cucumber/mid"             # Label to apply to all images
file_extension = ".jpg"                 # File type to include

# Initialize S3 client
s3 = boto3.client('s3')

# List objects in the source S3 bucket
response = s3.list_objects_v2(Bucket=source_bucket, Prefix=source_prefix)

# Create the manifest file locally
with open(manifest_file_name, "w") as f:
    for obj in response.get('Contents', []):
        if obj['Key'].endswith(file_extension):  # Filter by file extension
            image_path = f"s3://{source_bucket}/{obj['Key']}"
            manifest_entry = {
                "source-ref": image_path,
                "label": label_name
            }
            f.write(f"{manifest_entry}\n")

print(f"Manifest file '{manifest_file_name}' created locally.")

# Upload the manifest file to the destination S3 bucket
s3.upload_file(manifest_file_name, output_bucket, f"manifests/{manifest_file_name}")

print(f"Manifest file uploaded to 's3://{output_bucket}/manifests/{manifest_file_name}'.")
