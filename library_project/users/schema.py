import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth import authenticate
from django.db import transaction
from graphql_jwt.shortcuts import get_token
import logging
from .models import User
from .permissions import admin_required, login_required

logger = logging.getLogger(__name__)


class UserType(DjangoObjectType):
    """GraphQL type for User model"""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'user_type', 'phone', 'address', 'is_active', 'created_at')


class UserQuery(graphene.ObjectType):
    """GraphQL queries for Users"""
    me = graphene.Field(UserType)
    all_users = graphene.List(UserType)
    user = graphene.Field(UserType, id=graphene.Int())
    users_by_type = graphene.List(UserType, user_type=graphene.String(required=True))
    
    @login_required
    def resolve_me(root, info):
        """Get current authenticated user"""
        return info.context.user
    
    @admin_required
    def resolve_all_users(root, info):
        """Get all users (admin only)"""
        return User.objects.all()
    
    @admin_required
    def resolve_user(root, info, id):
        """Get a single user by ID (admin only)"""
        try:
            return User.objects.get(pk=id)
        except User.DoesNotExist:
            return None
    
    @admin_required
    def resolve_users_by_type(root, info, user_type):
        """Get users by type (admin only)"""
        return User.objects.filter(user_type=user_type)


class RegisterUser(graphene.Mutation):
    """Mutation to register a new user"""
    class Arguments:
        username = graphene.String(required=True)
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        first_name = graphene.String()
        last_name = graphene.String()
        phone = graphene.String()
        address = graphene.String()
        user_type = graphene.String()
    
    user = graphene.Field(UserType)
    token = graphene.String()
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(root, info, username, email, password, **kwargs):
        logger.info(f"Registration attempt for username: {username}, email: {email}")
        
        try:
            # Use transaction to ensure atomicity
            with transaction.atomic():
                # Default to regular user unless registering user is admin
                user_type = kwargs.get('user_type', 'regular')
                current_user = info.context.user
                
                # Only admins can create admin users
                if user_type == 'admin':
                    if not current_user.is_authenticated or not current_user.is_admin():
                        logger.warning(f"Non-admin tried to create admin user: {username}")
                        user_type = 'regular'
                
                logger.debug(f"Creating user with type: {user_type}")
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    user_type=user_type,
                    **{k: v for k, v in kwargs.items() if k != 'user_type'}
                )
                logger.info(f"User created successfully: {user.id}")
                
                logger.debug("Generating JWT token...")
                token = get_token(user)
                logger.info(f"Token generated for user: {username}")
            
            return RegisterUser(
                user=user,
                token=token,
                success=True,
                message="User registered successfully"
            )
        except Exception as e:
            logger.error(f"Registration failed for {username}: {str(e)}", exc_info=True)
            return RegisterUser(
                user=None,
                token=None,
                success=False,
                message=str(e)
            )


class LoginUser(graphene.Mutation):
    """Mutation to login a user"""
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
    
    user = graphene.Field(UserType)
    token = graphene.String()
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(root, info, username, password):
        user = authenticate(username=username, password=password)
        if user:
            token = get_token(user)
            return LoginUser(
                user=user,
                token=token,
                success=True,
                message="Login successful"
            )
        return LoginUser(
            user=None,
            token=None,
            success=False,
            message="Invalid credentials"
        )


class UpdateUser(graphene.Mutation):
    """Mutation to update user profile"""
    class Arguments:
        id = graphene.Int()
        email = graphene.String()
        first_name = graphene.String()
        last_name = graphene.String()
        phone = graphene.String()
        address = graphene.String()
        user_type = graphene.String()
    
    user = graphene.Field(UserType)
    success = graphene.Boolean()
    message = graphene.String()
    
    @login_required
    def mutate(root, info, **kwargs):
        try:
            user_id = kwargs.pop('id', None)
            current_user = info.context.user
            
            # Determine which user to update
            if user_id and current_user.is_admin():
                # Admin can update any user
                user = User.objects.get(pk=user_id)
            else:
                # Regular users can only update themselves
                user = current_user
            
            # Only admins can change user_type
            if 'user_type' in kwargs and not current_user.is_admin():
                kwargs.pop('user_type')
            
            for field, value in kwargs.items():
                if value is not None:
                    setattr(user, field, value)
            user.save()
            
            return UpdateUser(
                user=user,
                success=True,
                message="User updated successfully"
            )
        except User.DoesNotExist:
            return UpdateUser(
                user=None,
                success=False,
                message="User not found"
            )
        except Exception as e:
            return UpdateUser(
                user=None,
                success=False,
                message=str(e)
            )


class DeleteUser(graphene.Mutation):
    """Mutation to delete a user (admin only)"""
    class Arguments:
        id = graphene.Int(required=True)
    
    success = graphene.Boolean()
    message = graphene.String()
    
    @admin_required
    def mutate(root, info, id):
        try:
            user = User.objects.get(pk=id)
            user.delete()
            return DeleteUser(success=True, message="User deleted successfully")
        except User.DoesNotExist:
            return DeleteUser(success=False, message="User not found")
        except Exception as e:
            return DeleteUser(success=False, message=str(e))


class UserMutation(graphene.ObjectType):
    """GraphQL mutations for Users"""
    register = RegisterUser.Field()
    login = LoginUser.Field()
    update_user = UpdateUser.Field()
    delete_user = DeleteUser.Field()
