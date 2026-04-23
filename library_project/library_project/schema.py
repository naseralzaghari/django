import graphene
from books.schema import BookQuery, BookMutation
from users.schema import UserQuery, UserMutation
from loans.schema import BookLoanQuery, BookLoanMutation


class Query(BookQuery, UserQuery, BookLoanQuery, graphene.ObjectType):
    """Root Query combining all queries"""
    pass


class Mutation(BookMutation, UserMutation, BookLoanMutation, graphene.ObjectType):
    """Root Mutation combining all mutations"""
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
