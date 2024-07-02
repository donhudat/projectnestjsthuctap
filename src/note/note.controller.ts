import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { MyJwtGuard } from '../guard';
import { NoteService } from './note.service';
import { GetUser } from '../auth/decorator';
import { InsertNoteDTO, UpdateNoteDTO } from './dto';

@UseGuards(MyJwtGuard)
@Controller('notes')
export class NoteController {
  constructor(private noteService: NoteService) {

  }
  @Get()
  getNotes(@GetUser('id') userId: number) {
    return this.noteService.getNotes(userId)
  }

  @Get(':id')
  getNoteById(
    @Param('id', ParseIntPipe) noteId: number,
    @GetUser('id') userId: number
  ) {
    return this.noteService.getNoteById(noteId, userId);
  }


  @Post()
  insertNote(
    @GetUser('id') userId: number,
    @Body() insertNote: InsertNoteDTO
  ) {
    console.log("data")
    return this.noteService.insertNote(userId, insertNote)
  }

  @Patch(':id')
  updateNote(
    @Param('id', ParseIntPipe) noteId: number,
    @Body() updateNote: UpdateNoteDTO,
    @GetUser('id') userId: number
  ) {
    return this.noteService.updateNote(noteId, updateNote, userId);
  }
  @Delete(':id')
  deleteNote(
    @Param('id', ParseIntPipe) noteId: number,
    @GetUser('id') userId: number
  ) {
    return this.noteService.deleteNote(noteId, userId)
  }

}
