package com.example.demo.Controller;

import com.example.demo.DTO.ResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
@Slf4j
public class Exceptioncontroller {

    Logger logger = LoggerFactory.getLogger(this.getClass());

    //Chú thích này cho biết hàm badRequest sẽ xử lý các ngoại lệ thuộc loại BindException.
//    @ExceptionHandler ({BindException.class})
//    @ResponseStatus(code = HttpStatus.BAD_REQUEST)
//    public ResponseDTO<String> badRequest(BindException e){
//        logger.info("bad request");
//
//        //: Lấy danh sách các lỗi từ kết quả ràng buộc (BindingResult) của ngoại lệ BindException.
//        List<ObjectError> errors = e.getBindingResult().getAllErrors();
//        String msg ="";
//        for (ObjectError err : errors){
//            //Chuyển đổi lỗi hiện tại thành đối tượng FieldError.
//            FieldError fieldError =(FieldError) err;
//            // VD username và password rỗng, fieldError.getField() cho username trả về "username", err.getDefaultMessage() cho username trả về "must not be empty".
//            msg += fieldError.getField()+ ":" + err.getDefaultMessage() + ";" ;
//        }
//        return ResponseDTO.<String>builder().status(404).msg("No Data").data(msg).build();
//    }
}
