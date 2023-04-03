DROP PROCEDURE IF EXISTS getCommentsByBlog;
DELIMITER //
CREATE PROCEDURE getCommentsByBlog
(
    idIn    INT
)
BEGIN
    SELECT * FROM comments WHERE blogId=idIn;
END //
DELIMITER ;
