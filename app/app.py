#!/usr/bin/env python3
from flask import Flask, jsonify, abort, request, make_response, session
from flask_restful import reqparse, Resource, Api
from flask_session import Session
import json
import pymysql.cursors
from ldap3 import Server, Connection, ALL
from ldap3.core.exceptions import *
import ssl #include ssl libraries

import cgitb
import cgi
import sys
cgitb.enable()

import settings # Our server and db settings, stored in settings.py

app = Flask(__name__)
# Set Server-side session config: Save sessions in the local app directory.
app.secret_key = settings.SECRET_KEY
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_NAME'] = 'peanutButter'
app.config['SESSION_COOKIE_DOMAIN'] = settings.APP_HOST
Session(app)

def sqlCallFetchAll(sqlIn, argsIn=None):
      try:
         dbConnection = pymysql.connect(
            settings.DB_HOST,
            settings.DB_USER,
            settings.DB_PASSWD,
            settings.DB_DATABASE,
            charset='utf8mb4',
            cursorclass= pymysql.cursors.DictCursor) 
         cursor = dbConnection.cursor()
         if argsIn != None:
            cursor.callproc(sqlIn,argsIn) # stored procedure, no arguments
         else:
            cursor.callproc(sqlIn) # stored procedure, no arguments
         rows = cursor.fetchall()
         dbConnection.commit()
      except:
         abort(500) # Nondescript server error
      finally:
         cursor.close()
         dbConnection.close()
      return rows   

def sqlCallFetchOne(sqlIn, argsIn=None):
      try:
         dbConnection = pymysql.connect(
            settings.DB_HOST,
            settings.DB_USER,
            settings.DB_PASSWD,
            settings.DB_DATABASE,
            charset='utf8mb4',
            cursorclass= pymysql.cursors.DictCursor) 
         cursor = dbConnection.cursor()
         if argsIn != None:
            cursor.callproc(sqlIn,argsIn) # stored procedure, no arguments
         else:
            cursor.callproc(sqlIn) # stored procedure, no arguments
         row = cursor.fetchone()
         dbConnection.commit()
      except:
         abort(500) # Nondescript server error
      finally:
         cursor.close()
         dbConnection.close()
      return row  
   
def addAuthors(rowsIn):
   for row in rowsIn:
      userId = row['userId']
      
      sql = 'getUsernameByUserId'
      args = (userId,)
      resultFromSql = sqlCallFetchOne(sql, args)
      row['author'] = resultFromSql['username']
   return rowsIn   

def correctDateAndTime(rowsIn):
   for row in rowsIn:
      dateCreated = row['dateCreated']
      row['dateCreated'] = str(dateCreated).split('00:00:00')[0]
   return rowsIn   

      

####################################################################################
#
# Error handlers
#
@app.errorhandler(400) # decorators to add to 400 response
def not_found(error):
   return make_response(jsonify( { 'status': 'Bad request' } ), 400)

@app.errorhandler(401) # decorators to add to 401 response
def not_found(error):
   return make_response(jsonify( { 'status': 'Unauthorized' } ), 401) ## made change here ....................********

@app.errorhandler(403) # decorators to add to 403 response
def not_found(error):
   return make_response(jsonify( { 'status': 'Access Denied. Login Required' } ), 403)

@app.errorhandler(404) # decorators to add to 400 response
def not_found(error):
   return make_response(jsonify( { 'status': 'Empty Search Result' } ), 404)

@app.errorhandler(405) # decorators to add to 405 response
def not_found(error):
   return make_response(jsonify( { 'status': 'Validation Error' } ), 405)

@app.errorhandler(500) # decorators to add to 500 response
def not_found(error):
   return make_response(jsonify( { 'status': 'Server Error' } ), 500)


api = Api(app)
####################################################################################


####################################################################################

class Logout(Resource):
   def get(sucessfully):
      if 'username' in session:
         session.pop('username', None)
         response = {'status': 'success'}
         responseCode = 204
      else:
         response = {'status': 'fail'}
         responseCode = 403

      return make_response(jsonify(response), responseCode)

api.add_resource(Logout, '/user/logout')

#Todo: if the username is not in the usertable add it.
class Login(Resource):
   def post(self):
      if not request.json:
         abort(400) # bad request

      # Parse the json
      parser = reqparse.RequestParser()
      try:
          # Check for required attributes in json document, create a dictionary
         parser.add_argument('username', type=str, required=True)
         parser.add_argument('password', type=str, required=True)
         request_params = parser.parse_args()
      except:
         abort(400) # bad request

      sql = 'getUserWithUsername'
      args = (request_params['username'],)
      row = sqlCallFetchOne(sql, args)
      userId = row['userId']

      if request_params['username'] in session:
         response = {'status': 'success', 'userId': userId}
         responseCode = 200
      else:
         try:
            ldapServer = Server(host=settings.LDAP_HOST)
            ldapConnection = Connection(ldapServer,
               raise_exceptions=True,
               user='uid='+request_params['username']+', ou=People,ou=fcs,o=unb',
               password = request_params['password'])
            ldapConnection.open()
            ldapConnection.start_tls()
            ldapConnection.bind()
            # At this point we have sucessfully authenticated.#check if the user is in the user database or add if not
            if(row == None):
               #add user
               sql = 'addUser'
               sqlCallFetchOne(sql, args)
            
            session['username'] = request_params['username']
            response = {'status': 'success', 'userId': userId}
         
            responseCode = 201
         except LDAPException:
            response = {'status': 'Access denied'}
            responseCode = 403
         finally:
            ldapConnection.unbind()

      return make_response(jsonify(response), responseCode)

   # GET: Check for a login
   #
   # Example curl command:
   # curl -i -H "Content-Type: application/json" -X GET -b cookie-jar http://cs3103.cs.unb.ca:61024/user/login
   def get(self):
      if 'username' in session:
         response = {'status': 'success'}
         responseCode = 200
      else:
         response = {'status': 'fail'}
         responseCode = 403

      return make_response(jsonify(response), responseCode)


api.add_resource(Login, '/user/login')

class BlogComments(Resource):
   def get(self, blogId):
      sql = 'getCommentsByBlog'
      args = (blogId,)
      rows = sqlCallFetchAll(sql, args)

      return make_response(jsonify({"comments": rows}), 200) # successful
      

api.add_resource(BlogComments, '/blogs/<int:blogId>/comments')

class BlogsByID(Resource):
   def get(self, blogId):
      sql = 'getBlogById'
      args = (blogId,)
      row = sqlCallFetchOne(sql, args)

      return make_response(jsonify(row), 200) # successful

api.add_resource(BlogsByID, '/blogs/<int:blogId>')

class Blogs(Resource):
   def get(self):
      sql = 'getBlogs'
      rows = sqlCallFetchAll(sql)
      rowsWithAuthor = addAuthors(rows)
      rowsWithAuthor = correctDateAndTime(rowsWithAuthor)
      
      return make_response(jsonify({"blogs": rowsWithAuthor}), 200) # successful

api.add_resource(Blogs, '/blogs')

class UserBlog(Resource):
   def get(self, userId):
        #retrieve all blogs in DB matching corresponding userId
         sql = 'getBlogsByUser'
         args = (userId,)
         rows = sqlCallFetchAll(sql, args)

         return make_response(jsonify({"blogs": rows}), 200) # successful  
      
   def post(self, userId):
      if not request.json:
         abort(400) # bad request
      
      if 'username' in session:
         #then add the new blog for this user.
         # Parse the json
         parser = reqparse.RequestParser()
         try:
            # Check for required attributes in json document, create a dictionary
            parser.add_argument('title', type=str, required=True)
            parser.add_argument('content', type=str, required=True)
            request_params = parser.parse_args()
         except:
            abort(400) # bad request
         sql = 'addBlog'
         args = (request_params['title'], request_params['content'], userId)
         row = sqlCallFetchOne(sql, args)

         uri = 'http://'+settings.APP_HOST+':'+str(settings.APP_PORT)
         uri = uri+"/user/" + str(userId) + "/blogs/"+str(row['blogId'])
         return make_response(jsonify( { "uri" : uri } ), 201)
      else:
         abort(403)

api.add_resource(UserBlog, '/user/<int:userId>/blogs')

#Todo: most important to complete ******
class UserBlogSpec(Resource):
   def put(self, userId, blogId):
      if not request.json:
         abort(400) # bad request

      if 'username' in session:
         # then blog update allowed
         parser = reqparse.RequestParser()
         try:
            parser.add_argument('title', type=str, required=True)            
            parser.add_argument('content', type=str, required=True)
            request_params = parser.parse_args()
         except:
            abort(400) # bad request
         # Both fields given
         if(request_params['title']!='' and request_params['content']!=''):
            sql = 'editBlog'
            args = (blogId, request_params['title'], request_params['content'])
         # Content blank
         elif(request_params['content']==''):
            sql = 'editBlogTitle'
            args = (blogId, request_params['title'])
         # Title blank
         else:
            sql = 'editBlogContent'
            args = (blogId, request_params['content'])
         row = sqlCallFetchOne(sql, args)

         uri = 'http://'+settings.APP_HOST+':'+str(settings.APP_PORT)
         uri = uri+"/user/" + str(userId) + "/blogs/"+str(blogId) 
         return make_response(jsonify( { "uri" : uri } ), 201)                   
      else:
         abort(403)

   def delete(self, userId, blogId):
      #ToDo: check if the user is authorized to delete this blog
      if 'username' in session:
         getTotalBlogsSql = 'getTotalBlogs'
         totalBeforeRemove = sqlCallFetchOne(getTotalBlogsSql)
         
         sql = 'removeBlog'
         args = (blogId,)
         sqlCallFetchOne(sql,args)
         
         totalAfterRemove = sqlCallFetchOne(getTotalBlogsSql)
         
         if(totalBeforeRemove != totalAfterRemove):
            return 204
         else:
            return abort(404)
      else:
         abort(403)  

api.add_resource(UserBlogSpec, '/user/<int:userId>/blogs/<int:blogId>')

class UserBlogComment(Resource):
   def get(self, userId, blogId):
         sql = 'getCommentsByBlog'
         args = (blogId,)
         rows = sqlCallFetchAll(sql, args)

         return make_response(jsonify({"comments": rows}), 200) # successful  
   
   def post(self, blogId, userId):
      if not request.json:
         abort(400) # bad request
      if 'username' in session:
         # Parse the json
         parser = reqparse.RequestParser()
         try:
            # Check for required attributes in json document, create a dictionary
            parser.add_argument('content', type=str, required=True)
            request_params = parser.parse_args()
         except:
            abort(400) # bad request
         sql = 'addComment'
         args = (request_params['content'], userId, blogId)
         row = sqlCallFetchOne(sql, args)

         uri = 'http://'+settings.APP_HOST+':'+str(settings.APP_PORT)
         uri = uri+"/user/" + str(userId) + "/blogs/"+str(blogId) + "/comments/" + str(row['commentId'])
         return make_response(jsonify( { "uri" : uri } ), 201)   
      else: 
         abort(403)

api.add_resource(UserBlogComment, '/user/<int:userId>/blogs/<int:blogId>/comments')

class UserBlogCommentSpec(Resource): # fix this one
   def put(self, userId, blogId, commentId):
      if not request.json:
               abort(400) # bad request

      if 'username' in session:
         # then blog update allowed
         parser = reqparse.RequestParser()
         try:
            parser.add_argument('content', type=str, required=True)
            request_params = parser.parse_args()
         except:
            abort(400) # bad request
         sql = 'editComment'
         args = (commentId, request_params['content'])
         row = sqlCallFetchOne(sql, args)

         uri = 'http://'+settings.APP_HOST+':'+str(settings.APP_PORT)
         uri = uri+"/user/" + str(userId) + "/blogs/"+str(blogId)
         uri = uri+"/comments/" + str(commentId)
         return make_response(jsonify( { "uri" : uri } ), 201)               
      else:
         abort(403)


   def delete(self, userId, blogId, commentId): 
      if 'username' in session:      
         count = 'getTotalComments'
         totalBeforeRemove = sqlCallFetchOne(count)
         
         sql = 'removeComment'
         args = (commentId,)
         sqlCallFetchOne(sql,args)
         
         totalAfterRemove = sqlCallFetchOne(count)
         
         if(totalBeforeRemove != totalAfterRemove):
            return 204
         else:
            abort(404)
      else:
         abort(403)

api.add_resource(UserBlogCommentSpec, '/user/<int:userId>/blogs/<int:blogId>/comments/<int:commentId>')


#############################################################################
# xxxxx= last 5 digits of your studentid. If xxxxx > 65535, subtract 30000
if __name__ == "__main__":
   #
   # You need to generate your own certificates. To do this:
   #	1. cd to the directory of this app
   #	2. run the makeCert.sh script and answer the questions.
   #	   It will by default generate the files with the same names specified below.
   #
   context = ('cert.pem', 'key.pem') # Identify the certificates you've generated.
   app.run(
      host=settings.APP_HOST,
      port=settings.APP_PORT,
      ssl_context=context,
      debug=settings.APP_DEBUG)
