DELIMITER //
CREATE PROCEDURE editBlogContent
(
    idIn        INT,
    contentIn   longtext
)
BEGIN
    UPDATE blogs SET content=contentIn WHERE blogId=idIn; 
END //
DELIMITER ;
