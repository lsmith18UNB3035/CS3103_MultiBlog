DROP TABLE IF EXISTS users;
CREATE TABLE users(
	userId int auto_increment,
	username varchar(25) not null,
	primary key(userId)
);

DROP TABLE IF EXISTS blogs;
CREATE TABLE blogs(
	blogId int auto_increment,
	title varchar(50) not null,
	content longtext not null,
	dateCreated date not null,
	userId int not null,
	primary key(blogId,userId),
	constraint fk_blog_creator foreign key(userId) references users(userId) on delete cascade on update restrict
);

DROP TABLE IF EXISTS comments;
CREATE TABLE comments(
	commentId int auto_increment,
	content longtext not null,
	dateCreated date not null,
	blogId int not null,
	userId int not null,
	primary key(commentId, userId, blogId),
	constraint fk_comment_creator foreign key(userId) references users(userId), 
	constraint fk_blog foreign key(blogId) references blogs(blogId) on delete cascade on update restrict
);


