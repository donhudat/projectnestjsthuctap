import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InsertNoteDTO, UpdateNoteDTO } from "./dto";
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class NoteService {
  constructor(private prismaService: PrismaService) { }

  async insertNote(
    userId: number,
    insertNoteDTO: InsertNoteDTO
  ) {
    const note = await this.prismaService.note.create({
      data: {
        title: insertNoteDTO.title,
        description: insertNoteDTO.description,
        url: insertNoteDTO.url,
        userId: userId, // Chỉ truyền userId dưới dạng số nguyên
      },
    });
    return note;
  }


  async getNoteById(noteId: number, userId: number) {
    const note = await this.prismaService.note.findUnique({
      where: {
        id: noteId,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('You do not have access to view this note');
    }

    return note;
  }


  async getNotes(userId: number) {
    const notes = await this.prismaService.note.findMany({
      where: {
        userId,
      },
    });
    return notes;
  }



  async updateNote(noteId: number, updateNote: UpdateNoteDTO, userId: number) {
    // Retrieve the note to check if the user is authorized to update it
    const note = await this.prismaService.note.findUnique({
      where: {
        id: noteId,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('You do not have access to update this note');
    }

    // Proceed with the update
    const updatedNote = await this.prismaService.note.update({
      where: {
        id: noteId,
      },
      data: {
        title: updateNote.title ?? undefined,
        description: updateNote.description ?? undefined,
        url: updateNote.url ?? undefined,
      },
    });

    return updatedNote;
  }

  async deleteNote(noteId: number, userId: number) {
    const note = await this.prismaService.note.findUnique({
      where: {
        id: noteId,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('You do not have access to delete this note');
    }

    await this.prismaService.note.delete({
      where: {
        id: noteId,
      },
    });

    return { message: 'Note deleted successfully' };
  }
}