"""Shared storage utilities for AWS S3 operations.

This module provides generic, reusable S3 helpers that can be used across
any Django app in this project (books, users, loans, etc.).
"""
import uuid
import logging
from datetime import datetime

import boto3
from botocore.exceptions import ClientError
from django.conf import settings

logger = logging.getLogger(__name__)


def get_s3_client():
    """Create and return a configured S3 client."""
    return boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
        config=boto3.session.Config(signature_version=settings.AWS_S3_SIGNATURE_VERSION),
    )


def generate_presigned_url(file_key, expiration=3600, content_disposition='inline', content_type=None):
    """
    Generate a presigned URL for an S3 object.

    Args:
        file_key:            S3 object key (path inside the bucket).
        expiration:          URL validity in seconds (default: 1 hour).
        content_disposition: 'inline' to view in browser, 'attachment' to force download.
        content_type:        Override the Content-Type header (e.g. 'application/pdf').
                             When None, no Content-Type override is applied.

    Returns:
        Presigned URL string, or None on error.
    """
    if not file_key:
        return None

    try:
        s3_client = get_s3_client()

        filename = file_key.split('/')[-1]
        params = {
            'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
            'Key': file_key,
            'ResponseContentDisposition': (
                f'attachment; filename="{filename}"'
                if content_disposition == 'attachment'
                else f'inline; filename="{filename}"'
            ),
        }

        if content_type:
            params['ResponseContentType'] = content_type

        url = s3_client.generate_presigned_url(
            'get_object',
            Params=params,
            ExpiresIn=expiration,
        )
        return url

    except ClientError as e:
        logger.error("Error generating presigned URL for %s: %s", file_key, e)
        return None
    except Exception as e:
        logger.error("Unexpected error generating presigned URL for %s: %s", file_key, e)
        return None


def upload_file_to_s3(file, folder, object_id=None, content_type='application/octet-stream'):
    """
    Upload a file to S3 under a namespaced folder path.

    The resulting S3 key has the form::

        <AWS_LOCATION>/<folder>/<object_id_prefix><timestamp>_<uuid>_<filename>

    Args:
        file:         File-like object (e.g. from ``request.FILES``).
        folder:       Logical folder name that groups related uploads
                      (e.g. ``'books'``, ``'avatars'``, ``'documents'``).
        object_id:    Optional ID of the owning model instance, used as a
                      prefix to make keys easier to identify and manage.
        content_type: MIME type for the uploaded object
                      (default: ``'application/octet-stream'``).

    Returns:
        S3 object key string on success, or None on failure.
    """
    if not file:
        return None

    try:
        s3_client = get_s3_client()

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_id = str(uuid.uuid4())[:8]
        safe_name = file.name.replace(' ', '_')
        id_prefix = f"{object_id}_" if object_id is not None else ""
        file_key = f"{settings.AWS_LOCATION}/{folder}/{id_prefix}{timestamp}_{unique_id}_{safe_name}"

        s3_client.upload_fileobj(
            file,
            settings.AWS_STORAGE_BUCKET_NAME,
            file_key,
            ExtraArgs={
                'ContentType': content_type,
                'ServerSideEncryption': 'AES256',
            },
        )

        logger.info("Uploaded file to S3: %s", file_key)
        return file_key

    except ClientError as e:
        logger.error("Error uploading file to S3 (folder=%s): %s", folder, e)
        return None
    except Exception as e:
        logger.error("Unexpected error uploading file to S3 (folder=%s): %s", folder, e)
        return None


def delete_file_from_s3(file_key):
    """
    Delete a file from S3.

    Args:
        file_key: S3 object key to delete. Accepts both a plain string key
                  and a Django FieldFile (it will call ``.name`` automatically).

    Returns:
        True on success, False otherwise.
    """
    # Accept Django FieldFile objects as well as plain strings.
    key = getattr(file_key, 'name', file_key)

    if not key:
        return False

    try:
        s3_client = get_s3_client()
        s3_client.delete_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=key,
        )
        logger.info("Deleted file from S3: %s", key)
        return True

    except ClientError as e:
        logger.error("Error deleting file from S3 (%s): %s", key, e)
        return False
    except Exception as e:
        logger.error("Unexpected error deleting file from S3 (%s): %s", key, e)
        return False
