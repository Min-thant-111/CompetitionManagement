package com.project.Backend.File;

import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FileController {

    @Autowired
    private GridFsTemplate gridFsTemplate;

    @Autowired
    private GridFSBucket gridFSBucket;

    @GetMapping("/{id}")
    public ResponseEntity<?> getFile(@PathVariable String id) {
        try {
            ObjectId objectId;
            try {
                objectId = new ObjectId(id);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }

            GridFSFile gridFSFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(objectId)));

            if (gridFSFile == null) {
                return ResponseEntity.notFound().build();
            }

            GridFsResource resource = new GridFsResource(gridFSFile, gridFSBucket.openDownloadStream(gridFSFile.getObjectId()));
            MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
            if (gridFSFile.getMetadata() != null) {
                Object type = gridFSFile.getMetadata().get("_contentType");
                if (type == null) {
                    type = gridFSFile.getMetadata().get("contentType");
                }
                if (type != null) {
                    try {
                        mediaType = MediaType.parseMediaType(type.toString());
                    } catch (Exception ignored) {
                    }
                }
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + gridFSFile.getFilename() + "\"")
                    .body(new InputStreamResource(resource.getInputStream()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
