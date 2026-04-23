"""Utility functions for AWS S3 operations"""
import boto3
from botocore.exceptions import ClientError
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def get_s3_client():
    """Create and return an S3 client"""
    return boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
        config=boto3.session.Config(signature_version=settings.AWS_S3_SIGNATURE_VERSION)
    )


def generate_presigned_url(file_key, expiration=3600, content_disposition='inline'):
    """
    Generate a presigned URL for S3 object
    
    Args:
        file_key: S3 object key (file path in bucket)
        expiration: URL expiration time in seconds (default 1 hour)
        content_disposition: 'inline' for viewing, 'attachment' for downloading
    
    Returns:
        Presigned URL string or None if error
    """
    if not file_key:
        return None
    
    try:
        s3_client = get_s3_client()
        
        # Set response parameters based on content disposition
        params = {
            'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
            'Key': file_key,
        }
        
        if content_disposition:
            # Extract filename from key
            filename = file_key.split('/')[-1]
            if content_disposition == 'attachment':
                params['ResponseContentDisposition'] = f'attachment; filename="{filename}"'
            else:  # inline
                params['ResponseContentDisposition'] = f'inline; filename="{filename}"'
                params['ResponseContentType'] = 'application/pdf'
        
        url = s3_client.generate_presigned_url(
            'get_object',
            Params=params,
            ExpiresIn=expiration
        )
        
        return url
    
    except ClientError as e:
        logger.error(f"Error generating presigned URL: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error generating presigned URL: {e}")
        return None


def upload_pdf_to_s3(file, book_id):
    """
    Upload PDF file to S3
    
    Args:
        file: File object from GraphQL upload
        book_id: Book ID for organizing files
    
    Returns:
        S3 key (file path) or None if error
    """
    if not file:
        return None
    
    try:
        s3_client = get_s3_client()
        
        # Generate unique filename
        import uuid
        from datetime import datetime
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_id = str(uuid.uuid4())[:8]
        original_name = file.name.replace(' ', '_')
        file_key = f"{settings.AWS_LOCATION}/book_{book_id}_{timestamp}_{unique_id}_{original_name}"
        
        # Upload file
        s3_client.upload_fileobj(
            file,
            settings.AWS_STORAGE_BUCKET_NAME,
            file_key,
            ExtraArgs={
                'ContentType': 'application/pdf',
                'ServerSideEncryption': 'AES256'
            }
        )
        
        logger.info(f"Successfully uploaded PDF to S3: {file_key}")
        return file_key
    
    except ClientError as e:
        logger.error(f"Error uploading PDF to S3: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error uploading PDF: {e}")
        return None


def delete_pdf_from_s3(file_key):
    """
    Delete PDF file from S3
    
    Args:
        file_key: S3 object key to delete
    
    Returns:
        True if successful, False otherwise
    """
    if not file_key:
        return False
    
    try:
        s3_client = get_s3_client()
        s3_client.delete_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=file_key
        )
        logger.info(f"Successfully deleted PDF from S3: {file_key}")
        return True
    
    except ClientError as e:
        logger.error(f"Error deleting PDF from S3: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error deleting PDF: {e}")
        return False
