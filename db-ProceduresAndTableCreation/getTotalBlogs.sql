DROP PROCEDURE IF EXISTS getTotalBlogs;
DELIMITER //
CREATE PROCEDURE getTotalBlogs()
BEGIN
    select count(*) from blogs;

END //
DELIMITER ;
