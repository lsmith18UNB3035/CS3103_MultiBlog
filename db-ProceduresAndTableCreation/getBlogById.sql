DROP PROCEDURE IF EXISTS getBlogById;
DELIMITER //
CREATE PROCEDURE getBlogById
(
    idIn    INT
)
BEGIN
    SELECT * FROM blogs WHERE blogId=idIn;
END //
DELIMITER ;
